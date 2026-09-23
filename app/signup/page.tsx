"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AuthShell from "@/components/auth/AuthShell"
import SignupForm from "@/components/auth/SignupForm"

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupExperience />}>
      <SignupContent />
    </Suspense>
  )
}

function SignupContent() {
  const params = useSearchParams()
  return (
    <SignupExperience
      callbackUrl={params.get("callbackUrl") ?? ""}
      authError={params.get("error") ?? ""}
    />
  )
}

function SignupExperience({
  callbackUrl = "",
  authError = "",
}: {
  callbackUrl?: string
  authError?: string
}) {
  return (
    <AuthShell
      eyebrow="One Verified Network"
      title="Begin your next expedition circle."
      description="Create one verified traveller identity for bookings, wishlists, and Trip Circles across India."
    >
      <SignupForm />
      <SignupForm callbackUrl={callbackUrl} authError={authError} />
    </AuthShell>
  )
}
