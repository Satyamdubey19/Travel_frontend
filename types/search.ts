import type { DatePickerProps as UIDatePickerProps } from "@/components/ui/DatePicker"

export type LocationSource = "gps" | "ip" | null
export type DatePickerProps = UIDatePickerProps
export type LocationInputProps = { value: string; onChange: (value: string) => void; className?: string; placeholder?: string }
export type SearchBarProps = { onSearch?: (query: string) => void }
