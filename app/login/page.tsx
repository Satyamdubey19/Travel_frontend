"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AuthShell from "@/components/auth/AuthShell"
import LoginForm from "@/components/auth/LoginForm"
import Alert from "@/components/ui/Alert"

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginExperience />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const params = useSearchParams()
  return (
    <LoginExperience
      email={params.get("email") ?? ""}
      callbackUrl={params.get("callbackUrl") ?? ""}
      registered={params.get("registered") ?? ""}
      hostIntent={params.get("intent") === "host"}
      verification={params.get("verification") ?? ""}
      authError={params.get("error") ?? ""}
      passwordState={params.get("password") ?? ""}
    />
  )
}

function LoginExperience({
  email = "",
  callbackUrl = "",
  registered = "",
  hostIntent = false,
  verification = "",
  authError = "",
  passwordState = "",
}: {
  email?: string
  callbackUrl?: string
  registered?: string
  hostIntent?: boolean
  verification?: string
  authError?: string
  passwordState?: string
}) {
  return (
    <AuthShell
      eyebrow="One Secure Identity"
      title="Step into verified journeys across India."
      description="The same account follows you from discovery to booking—and into Host Studio when your host application is approved."
    >
      <div className="space-y-2.5 mb-2">
        {verification === "complete" ? (
          <Alert variant="success">Email verified. You can now sign in securely.</Alert>
        ) : null}
        {passwordState === "changed" ? (
          <Alert variant="success">Password updated. Sign in again on this device.</Alert>
        ) : null}
        {verification === "failed" ? (
          <Alert variant="error">This verification link is invalid or has expired. Please request a new link.</Alert>
        ) : null}
        {authError === "GOOGLE_SIGNIN_FAILED" ? (
          <Alert variant="error">Google sign-in could not be completed. Please try again or use email and password.</Alert>
        ) : null}
        {authError === "DEVICE_LIMIT_REACHED" ? (
          <Alert variant="warning">This account has reached its secure-device limit. Sign in below to manage devices.</Alert>
        ) : null}
        {authError === "ACCOUNT_INACTIVE" ? (
          <Alert variant="error">Your employee account is inactive. Please contact your corporate administrator.</Alert>
        ) : null}
        {authError === "PROVISIONING_DISABLED" ? (
          <Alert variant="warning">Automatic user provisioning is disabled for your organization. Please request access from your IT administrator.</Alert>
        ) : null}
        {authError === "SSO_NOT_CONFIGURED" ? (
          <Alert variant="warning">No active Single Sign-On configuration was found for your corporate domain.</Alert>
        ) : null}
        {authError === "SSO_FAILED" ? (
          <Alert variant="error">Corporate SSO authentication could not be completed. Please check your corporate credentials or try again.</Alert>
        ) : null}
      </div>

      <LoginForm
        initialEmail={email}
        callbackUrl={callbackUrl}
        registered={registered}
        hostIntent={hostIntent}
      />
    </AuthShell>
  )
}
