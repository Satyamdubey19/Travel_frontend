"use client"

import { useRef, useState } from "react"
import { ImageIcon, Upload, X } from "lucide-react"
import axios, { AxiosError } from "axios"
import type { PhotoUploaderProps } from "@/types/ui"

export default function PhotoUploader({ images, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      try {
        const body = new FormData()
        body.append("file", file)
        const res = await axios.post("/api/upload", body)
        const data = res.data as { url?: string; error?: string }
        if (res.status !== 200 || !data.url) {
          setError(data.error ?? "Upload failed")
          continue
        }
        uploaded.push(data.url)
      } catch (error) {
        const axiosError = error as AxiosError<{ error?: string }>
        setError(axiosError.response?.data?.error ?? "Upload failed. Please try again.")
      }
    }

    if (uploaded.length > 0) {
      const cleaned = images.filter(u => u.trim() !== "")
      onChange([...cleaned, ...uploaded])
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      {images.filter(u => u.trim()).length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.filter(u => u.trim()).map((url, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
             
              <img src={url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(images.indexOf(url))}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950/80 text-white opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-red-600"
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
            <span>Uploading photos...</span>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-cyan-700 shadow-sm">
              <Upload size={18} />
            </span>
            <span>Upload photos</span>
            <span className="text-xs font-medium text-slate-400">Choose one or multiple images</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={e => void handleFiles(e.target.files)}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <ImageIcon size={14} className="shrink-0" />
          {error}
        </div>
      )}

      <p className="text-xs text-slate-400">
        JPEG, PNG, WebP, or GIF. Max 10 MB per file.
      </p>
    </div>
  )
}
