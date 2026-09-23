"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PrivacyRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/terms")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">
      Loading Privacy & Data Protection Policy...
    </div>
  )
}

