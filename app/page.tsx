import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import HomeExperience from "@/components/home/HomeExperience"
import { Suspense } from "react"

export default function Home() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="min-h-[70vh] bg-[#f7f8fc]" aria-busy="true" />}>
        <HomeExperience />
      </Suspense>
      <Footer />
    </>
  )
}
