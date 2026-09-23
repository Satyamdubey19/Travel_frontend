"use client"
import { useParams } from "next/navigation"
import RentalListingForm from "@/components/host/RentalListingForm"
export default function EditRentalPage() { return <RentalListingForm rentalId={String(useParams<{ id: string }>().id)} /> }
