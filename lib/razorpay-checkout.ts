export type RazorpayCheckoutResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>
}

type RazorpayInstance = { open: () => void }
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance

let scriptPromise: Promise<boolean> | null = null

export function loadRazorpayCheckout() {
  if (typeof window === "undefined") return Promise.resolve(false)
  const target = window as Window & { Razorpay?: RazorpayConstructor }
  if (target.Razorpay) return Promise.resolve(true)

  scriptPromise ??= new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true })
      existing.addEventListener("error", () => resolve(false), { once: true })
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
  return scriptPromise
}

export async function openRazorpayCheckout(options: Omit<RazorpayOptions, "handler" | "modal">) {
  if (!(await loadRazorpayCheckout())) throw new Error("Payment gateway is unavailable")
  const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay
  if (!Razorpay) throw new Error("Payment gateway is unavailable")

  return new Promise<RazorpayCheckoutResponse>((resolve, reject) => {
    const checkout = new Razorpay({
      ...options,
      handler: resolve,
      modal: { ondismiss: () => reject(new Error("Payment window was closed")) },
    })
    checkout.open()
  })
}
