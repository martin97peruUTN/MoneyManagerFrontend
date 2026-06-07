export function FieldError({ errors }: { errors: Array<unknown> }) {
  const message = errors
    .filter(Boolean)
    .map((e) =>
      typeof e === 'string'
        ? e
        : e && typeof e === 'object' && 'message' in e
          ? String((e as { message: unknown }).message)
          : String(e),
    )
    .join(', ')

  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}
