type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>
  }[Keys]

export type SendEmailData = RequireAtLeastOne<
  {
    to: string
    from: string
    subject: string
    htmlView?: string
    html?: string
    data?: Record<string, unknown>
    emailLogId?: number // For email audit logging
  },
  'html' | 'htmlView'
>
