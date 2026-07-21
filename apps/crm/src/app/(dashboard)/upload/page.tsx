'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import {
  Upload, Download, FileSpreadsheet, CheckCircle, XCircle,
  AlertCircle, Clock, Eye, ChevronRight, RefreshCw,
} from 'lucide-react'
import { MOCK_BATCHES, formatDate } from '@/lib/data'
import clsx from 'clsx'

interface RowError { row: number; errors: string[] }

interface UploadResult {
  batchId: string
  totalRows: number
  successRows: number
  failedRows: number
  errors: RowError[]
}

export default function UploadPage() {
  const { user, isAdmin } = useAuth()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Bulk Upload" subtitle="Admin only" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={40} className="text-amber-400 mx-auto mb-3" />
            <p className="text-slate-500">Only admins can access bulk upload.</p>
            <Link href="/dashboard" className="btn-primary mt-4 inline-flex">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  function handleFile(f: File) {
    const allowed = ['.xlsx', '.xls', '.csv']
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) {
      alert('Only .xlsx, .xls, or .csv files are accepted.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB.')
      return
    }
    setFile(f)
    setResult(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setResult(null)

    // Simulate progress + API call
    for (let i = 10; i <= 90; i += 15) {
      await new Promise((r) => setTimeout(r, 250))
      setProgress(i)
    }
    // TODO Phase 3: replace simulation with real API call:
    // const formData = new FormData()
    // formData.append('file', file)
    // const res = await fetch('/api/uploads/properties', { method: 'POST', body: formData, headers: { Authorization: `Bearer ${token}` } })
    // const data = await res.json()

    // Simulated result
    await new Promise((r) => setTimeout(r, 400))
    setProgress(100)
    setResult({
      batchId: 'batch-sim-001',
      totalRows: 12,
      successRows: 10,
      failedRows: 2,
      errors: [
        { row: 5, errors: ['taluka: Invalid taluka "Gokarna" — must be one of BARDEZ, PERNEM, etc.'] },
        { row: 9, errors: ['salePrice: Expected number, received "five crore"', 'listingType: Must be SALE, RENT, or SALE_AND_RENT'] },
      ],
    })
    setUploading(false)
  }

  function downloadTemplate() {
    // TODO Phase 3: fetch from GET /api/uploads/template
    // For now create a simple CSV blob
    const headers = ['title','propertyType','listingType','region','taluka','village','salePrice','rentPrice','bedrooms','bathrooms','areaSqFt','description','amenities','reraNumber','furnishing','agentEmail']
    const example = ['3 BHK Villa in Vagator','VILLA','SALE','NORTH_GOA','BARDEZ','Vagator','4200000','','3','3','2200','Beautiful villa near beach','Pool|Garden|CCTV','PRGO123','fully-furnished','']
    const csv = [headers.join(','), example.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'easyliving-property-template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Bulk Upload" subtitle="Import multiple properties from Excel or CSV" />

      <div className="flex-1 p-6 max-w-[800px] mx-auto w-full space-y-5">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Bulk Property Upload</h2>
            <p className="page-subtitle">Upload up to 500 properties at once via CSV or Excel</p>
          </div>
          <button onClick={downloadTemplate} className="btn-secondary">
            <Download size={14} /> Download Template
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <p className="text-[13px] font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle size={15} /> How it works
          </p>
          <ol className="text-[12.5px] text-blue-700 space-y-1 list-decimal list-inside leading-relaxed">
            <li>Download the template above and fill in your property data (one property per row)</li>
            <li>Required columns: title, propertyType, listingType, region, taluka, village</li>
            <li>Upload the filled file — valid rows are imported as <strong>Pending Approval</strong></li>
            <li>Review and publish properties from the Properties page</li>
            <li>Rows with errors are skipped and listed below after upload</li>
          </ol>
        </div>

        {/* Drop zone */}
        <div
          className={clsx(
            'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
            dragging ? 'border-gold bg-gold/5 scale-[1.01]' : 'border-slate-200 hover:border-gold hover:bg-slate-50',
            file ? 'border-green-400 bg-green-50' : ''
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet size={28} className="text-green-600" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-green-700">{file.name}</p>
                <p className="text-[12px] text-green-600">{(file.size / 1024).toFixed(1)} KB · Ready to upload</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setProgress(0) }}
                className="text-[12px] text-slate-400 hover:text-red-500 underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-gold/10">
                <Upload size={26} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-700">Drop your Excel or CSV file here</p>
                <p className="text-[13px] text-slate-400 mt-1">or click to browse · .xlsx, .xls, .csv · max 10MB</p>
              </div>
              <button className="btn-secondary mt-2">Browse Files</button>
            </div>
          )}
        </div>

        {/* Upload button + progress */}
        {file && !result && (
          <div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 text-[13px]"
            >
              {uploading ? (
                <><RefreshCw size={15} className="animate-spin" /> Uploading... {progress}%</>
              ) : (
                <><Upload size={15} /> Upload {file.name}</>
              )}
            </button>
            {uploading && (
              <div className="mt-3 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gold h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-[14px] font-semibold text-navy">Upload Complete</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-slate-50 rounded-xl py-4">
                <p className="font-display text-[2rem] font-bold text-navy">{result.totalRows}</p>
                <p className="text-[12px] text-slate-400">Total Rows</p>
              </div>
              <div className="text-center bg-green-50 rounded-xl py-4">
                <p className="font-display text-[2rem] font-bold text-green-600">{result.successRows}</p>
                <p className="text-[12px] text-green-600">Imported</p>
              </div>
              <div className="text-center bg-red-50 rounded-xl py-4">
                <p className="font-display text-[2rem] font-bold text-red-500">{result.failedRows}</p>
                <p className="text-[12px] text-red-500">Failed</p>
              </div>
            </div>

            {result.successRows > 0 && (
              <div className="flex items-center gap-2 text-[13px] text-green-700 bg-green-50 rounded-lg px-4 py-3">
                <CheckCircle size={15} className="flex-shrink-0" />
                {result.successRows} properties imported as <strong>Pending Approval</strong>.
                <Link href="/properties?status=PENDING_APPROVAL" className="ml-auto text-green-700 font-bold underline whitespace-nowrap">
                  Review →
                </Link>
              </div>
            )}

            {result.errors.length > 0 && (
              <div>
                <p className="text-[12px] font-bold tracking-wide uppercase text-red-500 mb-2">Rows with errors (skipped)</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.errors.map(({ row, errors: errs }) => (
                    <div key={row} className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                      <p className="text-[12px] font-semibold text-red-700 mb-1">Row {row}</p>
                      {errs.map((e, i) => (
                        <p key={i} className="text-[12px] text-red-600 flex gap-2">
                          <XCircle size={12} className="flex-shrink-0 mt-0.5" />{e}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setFile(null); setResult(null); setProgress(0) }} className="btn-secondary">
              <Upload size={14} /> Upload Another File
            </button>
          </div>
        )}

        {/* Batch history */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-[14px] font-semibold text-navy">Upload History</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th className="pl-5">File</th>
                <th>Total</th>
                <th>Imported</th>
                <th>Failed</th>
                <th>Status</th>
                <th>Date</th>
                <th className="pr-5">Uploaded By</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BATCHES.map((batch) => (
                <tr key={batch.id}>
                  <td className="pl-5">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={14} className="text-green-600 flex-shrink-0" />
                      <span className="text-[12px] font-medium text-navy">{batch.fileName}</span>
                    </div>
                  </td>
                  <td className="text-[13px]">{batch.totalRows}</td>
                  <td className="text-green-600 font-semibold text-[13px]">{batch.successRows}</td>
                  <td className={clsx('font-semibold text-[13px]', batch.failedRows > 0 ? 'text-red-500' : 'text-slate-400')}>{batch.failedRows}</td>
                  <td>
                    <span className={clsx('badge',
                      batch.status === 'DONE' ? 'badge-published' :
                      batch.status === 'FAILED' ? 'badge-lost' : 'badge-pending'
                    )}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="text-[12px] text-slate-400">{formatDate(batch.createdAt)}</td>
                  <td className="pr-5 text-[12px] text-slate-500">
                    {batch.uploadedBy.firstName} {batch.uploadedBy.lastName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
