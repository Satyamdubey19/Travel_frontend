"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, LoaderCircle, MailCheck, ShieldCheck } from "lucide-react"
import AuthShell from "@/components/auth/AuthShell"
import Alert from "@/components/ui/Alert"
import Button from "@/components/ui/Button"
import api, { getApiErrorMessage } from "@/lib/axios"

function ConfirmEmailChangeContent() {
  const params = useSearchParams()
  const requestId = params.get("requestId") ?? ""
  const token = params.get("token") ?? ""
  const [state, setState] = useState<"ready" | "confirming" | "complete">("ready")
  const [error, setError] = useState("")
  const incomplete = !requestId || !token

  const confirm = async () => {
    if (incomplete) return
    setError("")
    setState("confirming")
    try {
      await api.post("/auth/email-change/confirm", { requestId, token })
      setState("complete")
    } catch (cause) {
      setError(getApiErrorMessage(cause, "We could not confirm this email change."))
      setState("ready")
    }
  }

  return (
    <AuthShell eyebrow="Account security" title="Confirm your new email with intent." description="A secure link alone does not make a change. Review the request, then explicitly confirm it. Every active device will be signed out afterward.">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-600">Secure email change</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">{incomplete ? "This link is incomplete" : state === "complete" ? "Your email is updated" : "Confirm your new email"}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{incomplete ? "Request a new email-change link from your signed-in profile. We cannot complete a change without both protected link values." : state === "complete" ? "For your security, active sessions were ended. Sign in again with the email address you just confirmed." : "Only continue if you started this request and entered your current password in your Travels Pro profile."}</p>
      </div>

      {incomplete ? <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800" href="/login">Back to sign in</Link> : null}
      {!incomplete && state === "complete" ? <div className="space-y-5"><Alert variant="success"><span className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" />Email updated securely.</span></Alert><Link className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800" href="/login">Sign in again</Link></div> : null}
      {!incomplete && state !== "complete" ? <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"><div className="flex items-center gap-2 font-bold text-slate-900"><ShieldCheck className="h-4 w-4 text-violet-600" />What happens next</div><p className="mt-2">Your new address becomes the sign-in address and every existing device session is revoked. This protects your account if another device was open.</p></div>{error ? <Alert variant="error">{error}</Alert> : null}<Button type="button" variant="brand" size="xl" className="w-full" disabled={state === "confirming"} onClick={() => void confirm()}>{state === "confirming" ? <LoaderCircle className="animate-spin" /> : <MailCheck />} {state === "confirming" ? "Confirming securely…" : "Confirm new email"}</Button><Link className="block text-center text-sm font-bold text-slate-600 hover:text-violet-700" href="/login">Cancel and return to sign in</Link></div> : null}
    </AuthShell>
  )
}

export default function ConfirmEmailChangePage() {
  return <Suspense fallback={<AuthShell eyebrow="Account security" title="Opening your secure request" description="Checking the confirmation link."><div className="flex items-center gap-3 text-sm font-bold text-slate-600"><LoaderCircle className="h-5 w-5 animate-spin" />Loading secure confirmation…</div></AuthShell>}><ConfirmEmailChangeContent /></Suspense>
}
