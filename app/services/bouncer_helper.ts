import { Bouncer } from '@adonisjs/bouncer'
import * as abilities from '#abilities/main'
import { policies } from '#policies/main'
import type User from '#models/user'

/**
 * Helper service to use bouncer abilities outside of HTTP context
 * Useful for jobs, commands, and other contexts where HttpContext is not available
 */
export default class BouncerHelper {
  /**
   * Create a bouncer instance for a specific user
   */
  static createForUser(user: User | null) {
    return new Bouncer(() => user, abilities, policies)
  }

  /**
   * Check if user can create subscription
   */
  static async canCreateSubscription(user: User): Promise<boolean> {
    const bouncer = this.createForUser(user)
    return await bouncer.allows('createSubscription')
  }

  /**
   * Check if user can send emails
   */
  static async canSendEmail(user: User): Promise<boolean> {
    const bouncer = this.createForUser(user)
    return await bouncer.allows('sendEmail')
  }

  /**
   * Check if user can view email history
   */
  static async canViewEmailHistory(user: User): Promise<boolean> {
    const bouncer = this.createForUser(user)
    return await bouncer.allows('viewEmailHistory')
  }

  /**
   * Check if user can export data
   */
  static async canExportData(user: User): Promise<boolean> {
    const bouncer = this.createForUser(user)
    return await bouncer.allows('exportData')
  }

  /**
   * Check if user can view a specific subscription
   */
  static async canViewSubscription(user: User, subscription: any): Promise<boolean> {
    const bouncer = this.createForUser(user)
    return await bouncer.allows('viewSubscription', subscription)
  }

  /**
   * Check if user can edit a specific subscription
   */
  static async canEditSubscription(user: User, subscription: any): Promise<boolean> {
    const bouncer = this.createForUser(user)
    return await bouncer.allows('editSubscription', subscription)
  }

  /**
   * Check if user can delete a specific subscription
   */
  static async canDeleteSubscription(user: User, subscription: any): Promise<boolean> {
    const bouncer = this.createForUser(user)
    return await bouncer.allows('deleteSubscription', subscription)
  }

  /**
   * Check if user can view a specific email
   */
  static async canViewEmail(user: User, email: any): Promise<boolean> {
    const bouncer = this.createForUser(user)
    return await bouncer.allows('viewEmail', email)
  }
}
