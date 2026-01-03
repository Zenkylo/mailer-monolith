import type { HttpContext } from '@adonisjs/core/http'

import PolarService from '#services/polar_service'

export default class PolarController {
  private polarService = new PolarService()

  async redirectCustomerToBillingPortal({ auth, response }: HttpContext) {
    const { customerPortalUrl } = await this.polarService.createCustomerSession(auth.user?.nid!)
    response.redirect(customerPortalUrl)
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
