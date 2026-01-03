import env from '#start/env'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import PolarSubscription from '#models/polar_subscription'
import polarConfig from '#config/polar'
import { WebhookSubscriptionCreatedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload'
import { WebhookSubscriptionUpdatedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload'
import { WebhookSubscriptionCanceledPayload } from '@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload.js'
import { WebhookSubscriptionUncanceledPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionuncanceledpayload.js'
import { WebhookSubscriptionRevokedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionrevokedpayload.js'
import { WebhookSubscriptionActivePayload } from '@polar-sh/sdk/models/components/webhooksubscriptionactivepayload.js'
import { SubscriptionCustomer } from '@polar-sh/sdk/models/components/subscriptioncustomer'
import { Subscription } from '@polar-sh/sdk/models/components/subscription.js'
import { validateEvent } from '@polar-sh/sdk/webhooks'
import { Request } from '@adonisjs/core/http'
import { Polar } from '@polar-sh/sdk'
import { DateTime } from 'luxon'

export default class PolarService {
  private polar = new Polar({
    server: 'sandbox',
    accessToken: env.get('POLAR_ACCESS_TOKEN'),
  })

  public async validateEvent(request: Request) {
    const rawBody = request.raw()
    const headers = request.headers()
    const webhookSecret = env.get('POLAR_WEBHOOK_SECRET') as string
    if (!webhookSecret) {
      throw new Error('POLAR_WEBHOOK_SECRET not configured')
    }
    if (!rawBody) {
      throw new Error('Request body is required for webhook validation')
    }

    // Convert headers to Record<string, string> format expected by validateEvent
    const stringHeaders: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        stringHeaders[key] = value
      } else if (Array.isArray(value)) {
        stringHeaders[key] = value[0] || ''
      }
    }

    return validateEvent(rawBody, stringHeaders, webhookSecret)
  }

  public async handleWebhookEvent(event: any) {
    logger.info('start: Handling Polar webhook event')
    logger.info({
      type: event.type,
      id: event.data?.id,
      timeStamp: event.timestamp,
    })
    switch (event.type) {
      case 'subscription.created':
        await this.handleSubscriptionCreated(event as WebhookSubscriptionCreatedPayload)
        break
      case 'subscription.updated':
        await this.handleSubscriptionUpdated(event as WebhookSubscriptionUpdatedPayload)
        break
      // case 'subscription.active':
      //   await this.handleSubscriptionActive(event as WebhookSubscriptionActivePayload)
      //   break
      case 'subscription.canceled':
        await this.handleSubscriptionCanceled(event as WebhookSubscriptionCanceledPayload)
        break
      case 'subscription.uncanceled':
        await this.handleSubscriptionUncanceled(event as WebhookSubscriptionUncanceledPayload)
        break
      case 'subscription.revoked':
        await this.handleSubscriptionRevoked(event as WebhookSubscriptionRevokedPayload)
        break
      default:
        await this.unhandledEvent(event)
        break
    }
  }

  public async listProducts() {
    const { result: products } = await this.polar.products.list({
      page: 1,
      organizationId: '04bd8f38-ba04-4aea-8f40-5142ab9bf803', // TODO
    })
    return products.items
  }

  public async createCustomerSession(userNid: string) {
    return await this.polar.customerSessions.create({
      externalCustomerId: userNid,
      returnUrl: env.get('POLAR_CUSTOMER_PORTAL_RETURN_URL'),
    })
  }

  public async createUpgradeCheckoutSession({
    userNid,
    userEmail,
    tier,
  }: {
    userNid: string
    userEmail: string
    tier?: string
  }) {
    // Get product ID for the specified tier, defaulting to starter
    const productId = polarConfig.getProductId(tier || 'starter')

    return await this.polar.checkouts.create({
      products: [productId],
      metadata: {
        userId: userNid,
        tier: tier || 'starter',
        utmSource: 'app-portal',
        utmMedium: 'dashboard',
        utmCampaign: 'upgrade',
      },
      customerEmail: userEmail,
      externalCustomerId: userNid,
      successUrl: env.get('POLAR_SUCCESS_URL'),
      returnUrl: env.get('POLAR_CUSTOMER_PORTAL_RETURN_URL'),
    })
  }

  public async getCustomerStateByExternalId(nid: string) {
    const result = await this.polar.customers.getStateExternal({
      externalId: nid,
    })
    return result
  }

  public async createProductCheckoutSession({
    productId,
    userNid,
    userEmail,
  }: {
    productId: string
    userNid: string
    userEmail: string
  }) {
    return await this.polar.checkouts.create({
      products: [productId],
      customerEmail: userEmail,
      externalCustomerId: userNid,
      successUrl: env.get('POLAR_SUCCESS_URL'),
      metadata: {
        userNid,
        utmSource: 'app-portal',
        utmMedium: 'dashboard',
        utmCampaign: 'subscription',
      },
      // discountId: 'your-discount-id',
    })
  }

  /**
   * Private
   */
  private async getUserByPolarCustomer(subscriptionCustomer: SubscriptionCustomer) {
    const { email, externalId } = subscriptionCustomer
    if (externalId) {
      logger.info('Looking up user by externalId: %s', externalId)
      const user = await User.findBy('nid', externalId)
      if (user) {
        return user
      }
    }
    if (email) {
      const emailLower = email.toLowerCase()
      logger.info('Looking up user by email: %s', emailLower)
      const user = await User.findBy('email', emailLower)
      if (user) {
        return user
      }
    }
    logger.error('Customer not found with provided externalId or email')
    throw new Error('Customer not found with provided externalId or email')
  }

  /**
   * Maps Subscription data to PolarSubscription model properties
   */
  private mapSubscriptionToModelData(subscriptionData: Subscription, userId: number) {
    return {
      userId: userId,
      polarId: subscriptionData.id,
      polarAmount: subscriptionData.amount,
      polarCurrency: subscriptionData.currency,
      polarRecurringInterval: subscriptionData.recurringInterval,
      polarStatus: subscriptionData.status,
      polarCurrentPeriodStart: DateTime.fromJSDate(subscriptionData.currentPeriodStart),
      polarCurrentPeriodEnd: subscriptionData.currentPeriodEnd
        ? DateTime.fromJSDate(subscriptionData.currentPeriodEnd)
        : null,
      polarTrialStart: subscriptionData.trialStart
        ? DateTime.fromJSDate(subscriptionData.trialStart)
        : null,
      polarTrialEnd: subscriptionData.trialEnd
        ? DateTime.fromJSDate(subscriptionData.trialEnd)
        : null,
      polarCancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      polarCanceledAt: subscriptionData.canceledAt
        ? DateTime.fromJSDate(subscriptionData.canceledAt)
        : null,
      polarStartedAt: subscriptionData.startedAt
        ? DateTime.fromJSDate(subscriptionData.startedAt)
        : null,
      polarEndsAt: subscriptionData.endsAt ? DateTime.fromJSDate(subscriptionData.endsAt) : null,
      polarEndedAt: subscriptionData.endedAt ? DateTime.fromJSDate(subscriptionData.endedAt) : null,
      polarCustomerId: subscriptionData.customerId,
      polarProductId: subscriptionData.productId,
      polarDiscountId: subscriptionData.discountId,
      polarCheckoutId: subscriptionData.checkoutId,
      polarCustomerCancellationReason: subscriptionData.customerCancellationReason,
      polarCustomerCancellationComment: subscriptionData.customerCancellationComment,
      polarModifiedAt: subscriptionData.modifiedAt
        ? DateTime.fromJSDate(subscriptionData.modifiedAt)
        : null,
      polarMetadata: subscriptionData.metadata,
      polarCustomFieldData: subscriptionData.customFieldData || null,
    }
  }

  private async updateOrCreatePolarSubscription(subscriptionData: Subscription, userId: number) {
    const modelData = this.mapSubscriptionToModelData(subscriptionData, userId)

    let polarSub = await PolarSubscription.findBy('polarId', subscriptionData.id)
    if (!polarSub) {
      polarSub = await PolarSubscription.create(modelData)
      return polarSub
    }

    // Update existing subscription - exclude userId and polarId from updates
    const { userId: excludedUserId, polarId: excludedPolarId, ...updateData } = modelData
    Object.assign(polarSub, updateData)

    await polarSub.save()
    return polarSub
  }

  private async handleSubscriptionCreated(event: WebhookSubscriptionCreatedPayload) {
    const subscriptionData = event.data
    const user = await this.getUserByPolarCustomer(subscriptionData.customer)
    await this.updateOrCreatePolarSubscription(subscriptionData, user.id)
  }

  /**
   * This is a catch-all for any updates to the subscription, including status changes.
   * It covers active, canceled, uncanceled, and revoked.
   * We therefore do not need to do anything special in the other handlers.
   */
  private async handleSubscriptionUpdated(event: WebhookSubscriptionUpdatedPayload) {
    const subscriptionData = event.data
    const user = await this.getUserByPolarCustomer(subscriptionData.customer)
    await this.updateOrCreatePolarSubscription(subscriptionData, user.id)
  }

  private async handleSubscriptionCanceled(event: WebhookSubscriptionCanceledPayload) {
    const subscriptionData = event.data
    const user = await this.getUserByPolarCustomer(subscriptionData.customer)
    await this.updateOrCreatePolarSubscription(subscriptionData, user.id)
  }

  private async handleSubscriptionUncanceled(event: WebhookSubscriptionUncanceledPayload) {
    const subscriptionData = event.data
    const user = await this.getUserByPolarCustomer(subscriptionData.customer)
    await this.updateOrCreatePolarSubscription(subscriptionData, user.id)
  }

  private async handleSubscriptionRevoked(event: WebhookSubscriptionRevokedPayload) {
    const subscriptionData = event.data
    const user = await this.getUserByPolarCustomer(subscriptionData.customer)
    await this.updateOrCreatePolarSubscription(subscriptionData, user.id)
  }

  // private async handleSubscriptionActive(event: WebhookSubscriptionActivePayload) {
  //   const subscriptionData = event.data
  //   const user = await this.getUserByPolarCustomer(subscriptionData.customer)
  //   await this.updateOrCreatePolarSubscription(subscriptionData, user.id)
  // }

  private async unhandledEvent(event: any) {
    logger.warn('Unhandled event type: %s', event.type)
    logger.info('Received event timestamp: %s, id: %o', event.timestamp, event.data?.id)
    logger.info('Doing nothing for this event.')
  }
}
