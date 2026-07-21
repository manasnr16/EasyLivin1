/**
 * USER (AGENT) MANAGEMENT SERVICE
 *
 * Agent creation reuses the existing authService.registerUser flow
 * (POST /api/auth/register) — this file only covers list/detail/status/delete.
 *
 * Delete is deliberately not a plain prisma.user.delete(): Property.createdById
 * and Lead.createdById are required, non-cascading foreign keys, so deleting a
 * user who has ever created a property or lead would throw a P2003 violation.
 * Instead we either hard-delete (if the user has touched nothing yet) or
 * require the caller to nominate a replacement owner and deactivate.
 */

import { prisma } from '@easyliving/database';
import { AppError, NotFoundError } from '../../middleware/error.middleware.js';

const userListSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  locationTags: true,
  lastLoginAt: true,
  createdAt: true,
  _count: {
    select: { propertiesOwned: true, leadsAssigned: true },
  },
} as const;

export async function listUsers(filters: { role?: string; status?: string }) {
  return prisma.user.findMany({
    where: {
      ...(filters.role && { role: filters.role as any }),
      ...(filters.status && { status: filters.status as any }),
    },
    orderBy: { createdAt: 'desc' },
    select: userListSelect,
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: userListSelect });
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function setUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
  const user = await prisma.user.update({
    where: { id },
    data: {
      status,
      // Suspending forces logout everywhere; re-activating requires a fresh login anyway
      ...(status === 'SUSPENDED' && { refreshTokenHash: null }),
    },
    select: userListSelect,
  });
  return user;
}

interface DeleteResult {
  mode: 'DELETED' | 'DEACTIVATED';
}

export async function deleteOrDeactivateUser(
  targetId: string,
  reassignToId: string | undefined,
  actorId: string
): Promise<DeleteResult> {
  if (targetId === actorId) {
    throw new AppError(400, 'You cannot delete your own account');
  }

  if (reassignToId === targetId) {
    throw new AppError(400, 'Cannot reassign to the same user being deleted');
  }

  // The reference counts, the reassignment, and the delete/deactivate all run
  // inside one interactive transaction so nothing can be created against
  // targetId, and no PropertyAgent row can change, between the check and the
  // write — closing the race a separate count-then-act sequence would have.
  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id: targetId }, select: { id: true } });
    if (!target) throw new NotFoundError('User');

    const [propertiesOwned, leadsCreated, leadsAssigned, activities] = await Promise.all([
      tx.property.count({ where: { createdById: targetId } }),
      tx.lead.count({ where: { createdById: targetId } }),
      tx.lead.count({ where: { assignedToId: targetId } }),
      tx.leadActivity.count({ where: { userId: targetId } }),
    ]);

    const hasReferences = propertiesOwned > 0 || leadsCreated > 0 || leadsAssigned > 0 || activities > 0;

    if (!hasReferences) {
      await tx.user.delete({ where: { id: targetId } });
      return { mode: 'DELETED' as const };
    }

    if (!reassignToId) {
      throw new AppError(
        409,
        'This user has properties or leads attached. Choose a user to reassign them to before deleting.',
        'REASSIGNMENT_REQUIRED',
        { propertiesOwned, leadsCreated, leadsAssigned, activities }
      );
    }

    const reassignTo = await tx.user.findUnique({
      where: { id: reassignToId },
      select: { id: true, status: true },
    });
    if (!reassignTo) throw new AppError(400, 'Reassignment target user not found');
    if (reassignTo.status !== 'ACTIVE') {
      throw new AppError(400, 'Reassignment target must be an active user');
    }

    // PropertyAgent has a composite (propertyId, agentId) primary key — reassigning
    // could collide if the target user is already assigned to the same property.
    // Drop those collisions before bulk-updating the rest.
    const targetAssignments = await tx.propertyAgent.findMany({
      where: { agentId: targetId },
      select: { propertyId: true },
    });
    const alreadyAssignedElsewhere = targetAssignments.length
      ? await tx.propertyAgent.findMany({
          where: {
            agentId: reassignToId,
            propertyId: { in: targetAssignments.map((a) => a.propertyId) },
          },
          select: { propertyId: true },
        })
      : [];
    const collidingPropertyIds = alreadyAssignedElsewhere.map((a) => a.propertyId);

    await tx.property.updateMany({ where: { createdById: targetId }, data: { createdById: reassignToId } });
    await tx.lead.updateMany({ where: { createdById: targetId }, data: { createdById: reassignToId } });
    await tx.lead.updateMany({ where: { assignedToId: targetId }, data: { assignedToId: reassignToId } });
    if (collidingPropertyIds.length) {
      await tx.propertyAgent.deleteMany({
        where: { agentId: targetId, propertyId: { in: collidingPropertyIds } },
      });
    }
    await tx.propertyAgent.updateMany({
      where: { agentId: targetId, propertyId: { notIn: collidingPropertyIds } },
      data: { agentId: reassignToId },
    });
    // LeadActivity.userId is left untouched — it's historical audit trail, not live ownership.
    await tx.user.update({
      where: { id: targetId },
      data: { status: 'SUSPENDED', refreshTokenHash: null },
    });

    return { mode: 'DEACTIVATED' as const };
  }, { timeout: 15_000 });
}
