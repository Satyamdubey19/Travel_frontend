import Link from "next/link"

export default function Logo() {
  return (
    <Link href="/">
      <div className="flex items-center gap-3 text-white cursor-pointer hover:opacity-80 transition">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-700 text-white">GH</div>
        <div>
          <p className="text-sm font-semibold">GetHotels</p>
          <p className="text-xs text-slate-500">Travel & stays</p>
        </div>
      </div>
    </Link>
  )
}
