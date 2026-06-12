import FooterLinks from "./FooterLinks"
import Subscribe from "./Subscribe"

const Footer = () => {
  const discoverLinks = [
    { label: "Travel Article", href: "#" },
    { label: "Book Rooms", href: "#" },
    { label: "Find Restaurant", href: "#" },
  ]

  const termsLinks = [
    { label: "Terms & Condition", href: "#" },
    { label: "Policies", href: "#" },
  ]

  const aboutLinks = [
    { label: "About us", href: "#" },
    { label: "How to Book", href: "#" },
    { label: "Contact us", href: "#" },
  ]

  return (
    <footer className="border-t border-white/10 bg-[#081428] text-white">
      <div className="container mx-auto grid gap-10 px-6 py-16 md:grid-cols-6">
        <div className="space-y-8 md:col-span-2">
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            <p className="max-w-md text-sm font-medium text-white">Your perfect stay, just a click away.</p>
          </div>

          <Subscribe />
        </div>

        <div>
          <h4 className="mb-4 text-lg font-bold text-white">Discover</h4>
          <FooterLinks links={discoverLinks} />
        </div>

        <div>
          <h4 className="mb-4 text-lg font-bold text-white">Terms & Setting</h4>
          <FooterLinks links={termsLinks} />
        </div>

        <div>
          <h4 className="mb-4 text-lg font-bold text-white">About</h4>
          <FooterLinks links={aboutLinks} />
        </div>

        <div className="flex flex-col items-start gap-4 md:col-start-6 md:items-end md:text-right">
          <h4 className="mb-4 text-lg font-bold text-white">Follow Us</h4>
          <div className="flex items-center gap-3 md:justify-end">
            <a href="#" className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.462h-1.26c-1.243 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z" fill="currentColor" />
              </svg>
            </a>
            <a href="#" className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label="Google">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35 11.1h-9.43v2.8h5.47c-.24 1.4-.95 2.86-2.3 3.73v2.86h3.72c2.18-2.01 3.44-4.96 3.44-8.4 0-.56-.04-1.1-.1-1.63z" fill="#4285F4" />
                <path d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.72-2.86c-1.03.7-2.35 1.12-3.9 1.12-2.99 0-5.52-2.02-6.43-4.74H1.84v2.96C3.47 19.86 7.44 22 12 22z" fill="#34A853" />
                <path d="M5.57 13.97a7.2 7.2 0 0 1 0-3.94V7.07H1.84a10.93 10.93 0 0 0 0 9.86l3.73-2.96z" fill="#FBBC05" />
                <path d="M12 4.42c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.95 1.39 14.68.5 12 .5 7.44.5 3.47 2.64 1.84 5.97l3.73 2.96C6.48 6.45 9.01 4.42 12 4.42z" fill="#EA4335" />
              </svg>
            </a>
            <a href="#" className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label="Apple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.3 2C14.93 2 13.64 2.58 12.8 3.5c-.83.91-1.25 2.14-1.14 3.4.01.09.03.18.05.27.37 1.8 1.46 3.15 2.85 3.15 1.35 0 2.01-1.12 2.01-1.12s.88 1.72 2.85 1.7c.46 0 1.09-.05 1.79-.38.01 0 .02-.01.03-.01.2-.1.38-.23.53-.38.18-.17.34-.38.46-.62.07-.13.11-.27.14-.42.1-.43.1-.69.1-.92 0-1.93-1.05-3.56-2.34-4.54-.96-.75-2.13-1.14-3.29-1.14-.74 0-1.58.2-2.31.33-.11.02-.22.05-.33.07-.04.01-.08.01-.12.01-.63 0-1.21-.32-1.55-.82-.41-.64-.25-1.5.36-1.94.51-.36 1.18-.45 1.86-.26.74.2 1.43.55 2.08.96C14.16 2.24 15.27 2 16.3 2z" fill="currentColor" />
                <path d="M19.35 5.75c-.35-.61-.75-1.12-1.22-1.5-.84-.65-1.92-.91-2.97-.91-.45 0-.9.05-1.36.14-.68.14-1.39.36-2.02.66-.38.18-.73.38-1.03.61C11.5 4.95 10.8 5.9 10.55 7.03c-.15.56-.2 1.14-.2 1.68 0 1.58.56 2.43 1.02 3.02.47.59 1.06 1.03 1.92 1.04.86.01 1.23-.45 2.05-.45.81 0 1.3.45 2.05.46.74.01 1.85-.47 2.3-1.6.2-.46.24-.99.24-1.52 0-.75-.12-1.4-.45-1.95z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-white">
        &copy; 2025 GetHotels. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
