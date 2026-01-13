import { ServiceContext, TranslationKey } from '#types/translation_types'

export default class TranslationService {
  /**
   * Get translated message with fallback to default message
   */
  static getMessage(
    context: ServiceContext | undefined,
    translationKey: TranslationKey,
    fallbackMessage: string,
    data?: Record<string, any>
  ): string {
    return context?.i18n ? context.i18n.t(translationKey, data) : fallbackMessage
  }

  /**
   * Create a translated error with fallback
   */
  static createError(
    context: ServiceContext | undefined,
    translationKey: TranslationKey,
    fallbackMessage: string,
    data?: Record<string, any>
  ): Error {
    const message = this.getMessage(context, translationKey, fallbackMessage, data)
    return new Error(message)
  }

  /**
   * Throw a translated error with fallback
   */
  static throwError(
    context: ServiceContext | undefined,
    translationKey: TranslationKey,
    fallbackMessage: string,
    data?: Record<string, any>
  ): never {
    throw this.createError(context, translationKey, fallbackMessage, data)
  }
}
