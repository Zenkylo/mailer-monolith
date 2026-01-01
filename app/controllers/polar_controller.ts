import type { HttpContext } from '@adonisjs/core/http'

import PolarService from '#services/polar_service'
import PolarSubscription from '#models/polar_subscription'

export default class PolarController {
  private polarService = new PolarService()

  async renderBillingPage({ inertia, auth, request }: HttpContext) {
    const success = request.input('success') === 'true'
    const products = await this.polarService.listProducts()
    const userPolarSubscriptions = await PolarSubscription.query().where('user_id', auth.user?.id!)

    return inertia.render('dashboard/billing/billing', {
      products: products,
      subscription: userPolarSubscriptions ? userPolarSubscriptions[0] : null,
      success: success || false,
    })
  }

  async checkout({ auth, response, request }: HttpContext) {
    const tier = request.input('tier') // Optional tier parameter

    const checkout = await this.polarService.createUpgradeCheckoutSession({
      userNid: auth.user?.nid!,
      userEmail: auth.user?.email!,
      tier,
    })

    response.redirect(checkout.url)
  }

  async checkoutProduct({ auth, response, params }: HttpContext) {
    const { productId } = params

    if (!productId) return response.status(400).send('Product ID is required')

    const checkout = await this.polarService.createProductCheckoutSession({
      productId,
      userNid: auth.user?.nid!,
      userEmail: auth.user?.email!,
    })

    response.redirect(checkout.url)
  }

  async redirectCustomerToBillingPortal({ auth, response }: HttpContext) {
    const { customerPortalUrl } = await this.polarService.createCustomerSession(auth.user?.nid!)
    response.redirect(customerPortalUrl)
  }

  async checkoutSuccess({ inertia, request }: HttpContext) {
    const { checkout_id } = request.qs()
    return inertia.render('dashboard/checkout/success', {
      checkout_id,
    })
  }

  /**
   * In development, make sure we update the ngrok domain
   * to be whitelisted in vite.config.ts
   */
  async captureWebhook({ request, logger, response }: HttpContext) {
    logger.info('start: Received Polar webhook')
    try {
      const event = await this.polarService.validateEvent(request)
      await this.polarService.handleWebhookEvent(event)
      logger.info('end: Received Polar webhook')
      return response.status(202).send('')
    } catch (error) {
      logger.error('Error handling Polar webhook')
      logger.error({ err: error })
      return response.status(400).send('Error handling webhook')
    }
  }
}
