import Input from "@/components/ui/Input"
import type { LocationInputProps } from "@/types/search"

export default function LocationInput({ value, onChange, className, placeholder }: LocationInputProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? "Enter a destination"}
      className={className}
    />
  )
}
