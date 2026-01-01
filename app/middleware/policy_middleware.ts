import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SubscriptionPolicy from '#policies/subscription_policy'
import EmailPolicy from '#policies/email_policy'

/**
 * Policy middleware for checking user permissions
 */
export default class PolicyMiddleware {
  async handle(ctx: HttpContext, next: NextFn, ...args: string[]) {
    const [policyName, action] = args

    if (!ctx.auth.user) {
      return ctx.response.unauthorized('Authentication required')
    }

    const user = ctx.auth.user
    let allowed = false

    try {
      switch (policyName) {
        case 'subscription':
          const subscriptionPolicy = new SubscriptionPolicy()
          allowed = await this.checkSubscriptionPolicy(subscriptionPolicy, action, user, ctx)
          break

        case 'email':
          const emailPolicy = new EmailPolicy()
          allowed = await this.checkEmailPolicy(emailPolicy, action, user, ctx)
          break

        default:
          return ctx.response.badRequest(`Unknown policy: ${policyName}`)
      }

      if (!allowed) {
        return ctx.response.forbidden('Insufficient privileges')
      }

      await next()
    } catch (error) {
      return ctx.response.internalServerError('Policy check failed')
    }
  }

  private async checkSubscriptionPolicy(
    policy: SubscriptionPolicy,
    action: string,
    user: any,
    _ctx: HttpContext
  ): Promise<boolean> {
    switch (action) {
      case 'create':
        return await policy.create(user)
      case 'viewList':
        return await policy.viewList(user)
      case 'view':
        // For specific subscription, get from params
        const subscription = { userId: user.id } // You'd fetch the actual subscription
        return await policy.view(user, subscription)
      case 'edit':
        const editSubscription = { userId: user.id }
        return await policy.edit(user, editSubscription)
      case 'delete':
        const deleteSubscription = { userId: user.id }
        return await policy.delete(user, deleteSubscription)
      default:
        return false
    }
  }

  private async checkEmailPolicy(
    policy: EmailPolicy,
    action: string,
    user: any,
    _ctx: HttpContext
  ): Promise<boolean> {
    switch (action) {
      case 'send':
        return await policy.send(user)
      case 'viewHistory':
        return await policy.viewHistory(user)
      case 'exportData':
        return await policy.exportData(user)
      case 'view':
        const email = { userId: user.id } // You'd fetch the actual email
        return await policy.view(user, email)
      case 'preview':
        return await policy.preview(user)
      default:
        return false
    }
  }
}
