import Link from "next/link"

const NavLinks = () => {
  return (
    <nav className="flex gap-6">
      <Link href="/tours">Tours</Link>
      <Link href="/car-rental">Car Rental</Link>
      <Link href="/activities">Activities</Link>
    </nav>
  )
}

export default NavLinks
