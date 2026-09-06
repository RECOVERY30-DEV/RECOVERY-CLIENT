type ConsultationChoiceProps = Readonly<{
  checked: boolean
  disabled?: boolean
  name: string
  onChange: () => void
  value: string
}>

export function ConsultationChoice({
  checked,
  disabled = false,
  name,
  onChange,
  value,
}: ConsultationChoiceProps): React.JSX.Element {
  return (
    <label className="flex min-h-[42px] cursor-pointer items-center justify-between rounded-[8px] bg-neutral-100 px-[14px] py-2 text-[14px] leading-5 text-primary-100 has-[:disabled]:cursor-not-allowed has-[:disabled]:text-disabled-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-blue-800 has-[:focus-visible]:ring-offset-2">
      <span>{value}</span>
      <input
        checked={checked}
        className="size-5 accent-primary-blue-500"
        disabled={disabled}
        name={name}
        onChange={onChange}
        type="radio"
        value={value}
      />
    </label>
  )
}
