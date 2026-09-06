type ConsultationChoiceProps = Readonly<{
  checked: boolean
  name: string
  onChange: () => void
  value: string
}>

export function ConsultationChoice({
  checked,
  name,
  onChange,
  value,
}: ConsultationChoiceProps): React.JSX.Element {
  return (
    <label className="flex min-h-[42px] cursor-pointer items-center justify-between rounded-[8px] bg-neutral-100 px-[14px] py-2 text-[14px] leading-5 text-primary-100 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-blue-500 has-[:focus-visible]:ring-offset-2">
      <span>{value}</span>
      <input
        checked={checked}
        className="size-5 accent-primary-blue-500"
        name={name}
        onChange={onChange}
        type="radio"
        value={value}
      />
    </label>
  )
}
