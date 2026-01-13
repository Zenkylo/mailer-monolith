import TranslationService from '#services/translation_service'
import { ServiceContext, TRANSLATION_KEYS } from '#types/translation_types'
import logger from '@adonisjs/core/services/logger'
import axios, { AxiosResponse } from 'axios'

export interface FetchOptions {
  timeout?: number
  maxContentLength?: number
  maxBodyLength?: number
}

export interface FetchResult {
  data: any
  status: number
  headers: Record<string, any>
  url: string
}

export default class SecureDataFetcher {
  private static readonly DEFAULT_OPTIONS: Required<FetchOptions> = {
    timeout: 5000,
    maxContentLength: 1024 * 1024, // 1MB
    maxBodyLength: 1024 * 1024, // 1MB
  }

  private static readonly BLOCKED_HOSTNAMES = [
    'localhost',
    '0.0.0.0',
    '.', // DNS root
    'metadata.google.internal',
    '169.254.169.254', // AWS metadata
    'consul.service.consul',
  ]

  /**
   * Safely fetch data from a user-provided endpoint with security validations
   */
  static async fetchData(
    url: string,
    options: FetchOptions = {},
    context?: ServiceContext
  ): Promise<FetchResult> {
    const config = { ...this.DEFAULT_OPTIONS, ...options }

    // Validate the URL
    this.validateUrl(url, context)

    logger.info(`Secure fetch request to: ${url}`, { requestId: context?.requestId })

    try {
      const response: AxiosResponse = await axios.get(url, {
        timeout: config.timeout,
        maxRedirects: 0, // Prevent redirect attacks
        maxContentLength: config.maxContentLength,
        maxBodyLength: config.maxBodyLength,
        headers: {
          'User-Agent': 'SecureDataFetcher/1.0',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
        },
        validateStatus: (status) => status < 500, // Allow 4xx but not 5xx
      })

      // Validate response content type
      const contentType = response.headers['content-type'] || ''
      if (!contentType.includes('application/json')) {
        throw TranslationService.createError(
          context,
          TRANSLATION_KEYS.SECURE_DATA_FETCHER.INVALID_CONTENT_TYPE,
          `Invalid content type: ${contentType}. Only JSON responses are allowed.`,
          { contentType }
        )
      }

      logger.info(`Secure fetch successful: ${url} (${response.status})`, {
        requestId: context?.requestId,
      })

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        url: response.config.url || url,
      }
    } catch (error) {
      logger.error(`Secure fetch failed for ${url}`, {
        error: error.message,
        code: error.code,
        requestId: context?.requestId,
      })

      if (axios.isAxiosError(error)) {
        throw TranslationService.createError(
          context,
          TRANSLATION_KEYS.SECURE_DATA_FETCHER.REQUEST_FAILED,
          `Request failed: ${error.message} (${error.code || 'UNKNOWN'})`,
          { error: error.message, code: error.code || 'UNKNOWN' }
        )
      }

      throw error
    }
  }

  /**
   * Validate URL for security issues
   */
  private static validateUrl(url: string, context?: ServiceContext): void {
    let parsed: URL

    try {
      parsed = new URL(url)
    } catch {
      TranslationService.throwError(
        context,
        TRANSLATION_KEYS.SECURE_DATA_FETCHER.INVALID_URL_FORMAT,
        'Invalid URL format'
      )
    }

    // Only allow HTTPS
    if (parsed.protocol !== 'https:') {
      TranslationService.throwError(
        context,
        TRANSLATION_KEYS.SECURE_DATA_FETCHER.HTTPS_REQUIRED,
        'Invalid URL: HTTPS is required'
      )
    }

    // Only allow port 443 (default HTTPS port)
    const port = parsed.port || '443'
    if (port !== '443') {
      TranslationService.throwError(
        context,
        TRANSLATION_KEYS.SECURE_DATA_FETCHER.PORT_443_REQUIRED,
        'Invalid URL: only HTTPS on port 443 is allowed'
      )
    }

    // Hostname validation - check blocked hostnames
    const hostname = parsed.hostname.toLowerCase()

    // Check for empty hostname
    if (!hostname || hostname.trim() === '') {
      TranslationService.throwError(
        context,
        TRANSLATION_KEYS.SECURE_DATA_FETCHER.HOSTNAME_NOT_ALLOWED,
        'Invalid URL: hostname is not allowed'
      )
    }

    // Check if hostname has a proper domain structure (must contain at least one dot and have a TLD)
    const domainParts = hostname.split('.')
    if (domainParts.length < 2 || domainParts.some((part) => part === '')) {
      TranslationService.throwError(
        context,
        TRANSLATION_KEYS.SECURE_DATA_FETCHER.INVALID_DOMAIN_STRUCTURE,
        'Invalid URL: hostname must have a valid domain structure'
      )
    }

    if (this.BLOCKED_HOSTNAMES.includes(hostname)) {
      TranslationService.throwError(
        context,
        TRANSLATION_KEYS.SECURE_DATA_FETCHER.BLOCKED_HOSTNAME,
        `Invalid URL: hostname ${hostname} is not allowed`,
        { hostname }
      )
    }

    // URL length validation
    if (url.length > 2000) {
      TranslationService.throwError(
        context,
        TRANSLATION_KEYS.SECURE_DATA_FETCHER.URL_TOO_LONG,
        'Invalid URL: URL is too long'
      )
    }
  }

  /**
   * Verify endpoint ownership (for future implementation)
   */
  static async verifyEndpointOwnership(_url: string, _verificationToken: string): Promise<boolean> {
    // TODO: Implement verification challenge
    // 1. Generate unique token
    // 2. Make request to endpoint with token
    // 3. Endpoint must respond with token to prove ownership
    // 4. Similar to webhook verification patterns

    return false // Placeholder
  }

  /**
   * Get allowed domains for a specific user or plan
   */
  static getAllowedDomainsForUser(_userId: number): string[] {
    // TODO: Implement user-specific or plan-specific domain restrictions
    // For now, return empty array (no restrictions)
    return []
  }

  /**
   * Check if endpoint is allowed for a specific user
   */
  static async isEndpointAllowedForUser(_url: string, _userId: number): Promise<boolean> {
    // TODO: Implement user-specific endpoint restrictions
    // For now, return true (placeholder)
    return true
  }
}
