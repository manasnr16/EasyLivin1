'use client'

import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ExistingMedia, StepKey } from '../formTypes'

interface PublishIssue {
  label: string
  step: StepKey
}

interface MediaStepProps {
  isEdit: boolean
  newFiles: File[]
  onFilePick: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveNewFile: (index: number) => void
  existingMedia: ExistingMedia[]
  onDeleteExistingMedia: (mediaId: string) => void
  issues: PublishIssue[]
  onJumpToStep: (step: StepKey) => void
  status?: string
  lastUpdated?: string
}

export default function MediaStep({
  isEdit, newFiles, onFilePick, onRemoveNewFile, existingMedia, onDeleteExistingMedia,
  issues, onJumpToStep, status, lastUpdated,
}: MediaStepProps) {
  const photoCount = newFiles.length + existingMedia.length

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[14px] font-semibold text-navy">Photos &amp; Media</h3>
          <span className="text-[12px] text-slate-400">Photos: {photoCount}</span>
        </div>
        <p className="text-[12px] text-slate-400 mb-5">
          {isEdit ? 'Upload images, videos, and floor plans.' : 'Photos upload right after you save this property below.'} First image becomes the cover.
        </p>

        {photoCount === 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 mb-4">
            <p className="text-[12.5px] text-slate-500">No property photos yet — add clear photos to make this listing publish-ready.</p>
          </div>
        )}

        <label className="block border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-gold transition-colors cursor-pointer group">
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf" className="hidden" onChange={onFilePick} />
          <div className="w-12 h-12 bg-slate-100 group-hover:bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
            <Upload size={22} className="text-slate-400 group-hover:text-gold transition-colors" />
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">Drop photos here or click to upload</p>
          <p className="text-[12px] text-slate-400">JPG, PNG, WebP, MP4, PDF — max 10MB each. Up to 20 files.</p>
          <span className="btn-secondary mt-4 mx-auto inline-flex">
            <ImageIcon size={14} /> Choose Files
          </span>
        </label>

        {newFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-[12px] text-slate-400 mb-2">Selected — will upload when you save</p>
            <div className="flex gap-3 flex-wrap">
              {newFiles.map((file, i) => (
                <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-500 px-1 text-center line-clamp-3">{file.name}</span>
                  )}
                  <button type="button" onClick={() => onRemoveNewFile(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isEdit && existingMedia.length > 0 && (
          <div className="mt-4">
            <p className="text-[12px] text-slate-400 mb-2">Current images</p>
            <div className="flex gap-3 flex-wrap">
              {existingMedia.map((m) => (
                <div key={m.id} className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-100">
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                  {m.isCover && <span className="absolute top-1 left-1 text-[9px] bg-navy text-white px-1.5 py-0.5 rounded font-bold">COVER</span>}
                  <button type="button" onClick={() => onDeleteExistingMedia(m.id)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isEdit && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 flex items-center justify-between text-[13px]">
          <div><span className="text-slate-400">Status: </span><span className="text-navy font-medium">{status ?? '—'}</span></div>
          {lastUpdated && <div className="text-slate-400">Last updated {lastUpdated}</div>}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h3 className="text-[14px] font-semibold text-navy mb-3">Ready to Publish?</h3>
        {issues.length === 0 ? (
          <p className="flex items-center gap-2 text-[13px] text-emerald-700">
            <CheckCircle2 size={16} /> Everything needed to publish is in place.
          </p>
        ) : (
          <>
            <p className="text-[13px] text-amber-700 mb-3">
              {issues.length} item{issues.length > 1 ? 's' : ''} need attention before this property can be published.
            </p>
            <ul className="space-y-1.5">
              {issues.map((issue) => (
                <li key={issue.label}>
                  <button type="button" onClick={() => onJumpToStep(issue.step)} className="flex items-center gap-2 text-[13px] text-navy hover:underline">
                    <AlertCircle size={14} className="text-amber-500 shrink-0" /> {issue.label}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
