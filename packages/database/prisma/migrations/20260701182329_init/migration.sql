-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CLIENT_ADMIN', 'SALES_EXECUTIVE', 'MARKETING_MANAGER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('VILLA', 'APARTMENT', 'PLOT', 'BUNGALOW', 'COMMERCIAL', 'FARMHOUSE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'UNDER_NEGOTIATION', 'SOLD', 'RENTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT', 'SALE_AND_RENT');

-- CreateEnum
CREATE TYPE "GoaRegion" AS ENUM ('NORTH_GOA', 'SOUTH_GOA');

-- CreateEnum
CREATE TYPE "GoaTaluka" AS ENUM ('BARDEZ', 'PERNEM', 'BICHOLIM', 'TISWADI', 'SALCETE', 'MORMUGAO', 'QUEPEM', 'SANGUEM', 'CANACONA', 'PONDA');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'FLOOR_PLAN', 'BROCHURE');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'MAGICBRICKS', 'ACRES_99', 'REFERRAL', 'WALK_IN', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_DONE', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('ACTIVE', 'DUPLICATE', 'JUNK');

-- CreateEnum
CREATE TYPE "AssignmentMode" AS ENUM ('MANUAL', 'ROUND_ROBIN', 'LOCATION_BASED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SALES_EXECUTIVE',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatar_url" TEXT,
    "location_tags" "GoaTaluka"[],
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "refresh_token_hash" TEXT,
    "notify_on_new_lead" BOOLEAN NOT NULL DEFAULT true,
    "notify_by_email" BOOLEAN NOT NULL DEFAULT true,
    "notify_by_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "property_type" "PropertyType" NOT NULL,
    "listing_type" "ListingType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "sale_price" DECIMAL(14,2),
    "rent_price" DECIMAL(10,2),
    "rent_period" TEXT,
    "price_negotiable" BOOLEAN NOT NULL DEFAULT false,
    "price_on_request" BOOLEAN NOT NULL DEFAULT false,
    "region" "GoaRegion" NOT NULL,
    "taluka" "GoaTaluka" NOT NULL,
    "village" TEXT NOT NULL,
    "address" TEXT,
    "landmark" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "google_maps_url" TEXT,
    "pincode" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area_sq_ft" DECIMAL(10,2),
    "plot_area_sq_ft" DECIMAL(10,2),
    "floors" INTEGER,
    "furnishing" TEXT,
    "parking" INTEGER DEFAULT 0,
    "facing" TEXT,
    "rera_number" TEXT,
    "rera_expiry" TIMESTAMP(3),
    "possession_status" TEXT,
    "possession_date" TIMESTAMP(3),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "is_exclusive" BOOLEAN NOT NULL DEFAULT false,
    "amenities" TEXT[],
    "meta_title" TEXT,
    "meta_description" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "published_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "upload_batch_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_agents" (
    "property_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_agents_pkey" PRIMARY KEY ("property_id","agent_id")
);

-- CreateTable
CREATE TABLE "property_media" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "alt_text" TEXT,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "file_size_bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "city" TEXT,
    "source" "LeadSource" NOT NULL,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "status" "LeadStatus" NOT NULL DEFAULT 'ACTIVE',
    "budget" DECIMAL(14,2),
    "budget_max" DECIMAL(14,2),
    "notes" TEXT,
    "requirement_note" TEXT,
    "property_id" TEXT,
    "interested_in" "PropertyType",
    "preferred_region" "GoaRegion",
    "preferred_taluka" "GoaTaluka",
    "assigned_to_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "duplicate_of_id" TEXT,
    "external_ref" TEXT,
    "external_source" TEXT,
    "whatsapp_thread_id" TEXT,
    "first_contact_at" TIMESTAMP(3),
    "last_contact_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "from_stage" "LeadStage",
    "to_stage" "LeadStage",
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "property_id" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "converted_to_lead_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_batches" (
    "id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "total_rows" INTEGER NOT NULL,
    "success_rows" INTEGER NOT NULL DEFAULT 0,
    "failed_rows" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "error_log" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "upload_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_configs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "credentials" JSONB,
    "config" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "last_synced_at" TIMESTAMP(3),
    "last_error_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "area_tags" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "meta_title" TEXT,
    "meta_desc" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "buyer_email" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "alerts_on" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");

-- CreateIndex
CREATE INDEX "properties_status_listing_type_idx" ON "properties"("status", "listing_type");

-- CreateIndex
CREATE INDEX "properties_region_taluka_village_idx" ON "properties"("region", "taluka", "village");

-- CreateIndex
CREATE INDEX "properties_property_type_idx" ON "properties"("property_type");

-- CreateIndex
CREATE INDEX "properties_created_by_id_idx" ON "properties"("created_by_id");

-- CreateIndex
CREATE INDEX "properties_is_featured_status_idx" ON "properties"("is_featured", "status");

-- CreateIndex
CREATE INDEX "properties_slug_idx" ON "properties"("slug");

-- CreateIndex
CREATE INDEX "property_agents_agent_id_idx" ON "property_agents"("agent_id");

-- CreateIndex
CREATE INDEX "property_media_property_id_media_type_idx" ON "property_media"("property_id", "media_type");

-- CreateIndex
CREATE INDEX "property_media_property_id_is_cover_idx" ON "property_media"("property_id", "is_cover");

-- CreateIndex
CREATE INDEX "leads_phone_idx" ON "leads"("phone");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_source_stage_idx" ON "leads"("source", "stage");

-- CreateIndex
CREATE INDEX "leads_assigned_to_id_stage_idx" ON "leads"("assigned_to_id", "stage");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "lead_activities_lead_id_idx" ON "lead_activities"("lead_id");

-- CreateIndex
CREATE INDEX "lead_activities_user_id_idx" ON "lead_activities"("user_id");

-- CreateIndex
CREATE INDEX "enquiries_phone_idx" ON "enquiries"("phone");

-- CreateIndex
CREATE INDEX "enquiries_created_at_idx" ON "enquiries"("created_at");

-- CreateIndex
CREATE INDEX "upload_batches_uploaded_by_id_idx" ON "upload_batches"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "upload_batches_created_at_idx" ON "upload_batches"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "integration_configs_type_key" ON "integration_configs"("type");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_published_published_at_idx" ON "blog_posts"("published", "published_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "saved_searches_buyer_email_idx" ON "saved_searches"("buyer_email");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_upload_batch_id_fkey" FOREIGN KEY ("upload_batch_id") REFERENCES "upload_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agents" ADD CONSTRAINT "property_agents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agents" ADD CONSTRAINT "property_agents_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_duplicate_of_id_fkey" FOREIGN KEY ("duplicate_of_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_batches" ADD CONSTRAINT "upload_batches_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
