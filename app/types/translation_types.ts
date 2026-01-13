import { I18n } from '@adonisjs/i18n'

export interface ServiceContext {
  i18n?: I18n
  user?: any
  requestId?: string
}

// Central registry for all translation keys
export const TRANSLATION_KEYS = {
  // Secure Data Fetcher Keys
  SECURE_DATA_FETCHER: {
    INVALID_URL_FORMAT: 'messages.errors.secure_data_fetcher.invalid_url_format',
    HTTPS_REQUIRED: 'messages.errors.secure_data_fetcher.https_required',
    PORT_443_REQUIRED: 'messages.errors.secure_data_fetcher.port_443_required',
    HOSTNAME_NOT_ALLOWED: 'messages.errors.secure_data_fetcher.hostname_not_allowed',
    INVALID_DOMAIN_STRUCTURE: 'messages.errors.secure_data_fetcher.invalid_domain_structure',
    BLOCKED_HOSTNAME: 'messages.errors.secure_data_fetcher.blocked_hostname',
    URL_TOO_LONG: 'messages.errors.secure_data_fetcher.url_too_long',
    INVALID_CONTENT_TYPE: 'messages.errors.secure_data_fetcher.invalid_content_type',
    REQUEST_FAILED: 'messages.errors.secure_data_fetcher.request_failed',
  },

  // Subscription Service Keys (example for future use)
  SUBSCRIPTION_SERVICE: {
    NOT_FOUND: 'messages.errors.subscription_service.not_found',
    LIMIT_EXCEEDED: 'messages.errors.subscription_service.limit_exceeded',
    INVALID_CRON: 'messages.errors.subscription_service.invalid_cron',
  },

  // Auth Keys (example for future use)
  AUTH: {
    UNAUTHORIZED: 'messages.errors.unauthorized',
    FORBIDDEN: 'messages.errors.auth.forbidden',
  },

  // General Error Keys
  GENERAL: {
    RATE_LIMITED: 'messages.errors.rate_limited',
    BAD_REQUEST: 'messages.errors.bad_request',
    ROUTE_NOT_FOUND: 'messages.errors.route_not_found',
  },
} as const

// Type for all possible translation keys (flattened from TRANSLATION_KEYS)
type ExtractTranslationKeys<T> =
  T extends Record<string, infer U> ? (U extends string ? U : ExtractTranslationKeys<U>) : never

export type TranslationKey = ExtractTranslationKeys<typeof TRANSLATION_KEYS>
