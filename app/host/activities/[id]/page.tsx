"use client"
import {useParams} from "next/navigation"
import ActivityListingForm from "@/components/host/ActivityListingForm"
export default function EditActivityPage(){return <ActivityListingForm activityId={String(useParams<{id:string}>().id)}/>} 
