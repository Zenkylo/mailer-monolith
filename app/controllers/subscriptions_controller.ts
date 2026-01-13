import Subscription from '#models/subscription'
import User from '#models/user'
import SecureDataFetcher from '#services/secure_data_fetcher'
import type { HttpContext } from '@adonisjs/core/http'
import parser from 'cron-parser'
import { DateTime } from 'luxon'

export default class SubscriptionsController {
  public async showList({ auth, inertia, bouncer }: HttpContext) {
    const user = auth.user!
    const subscriptions = await Subscription.query().where('user_id', user.id)

    // Use bouncer to check creation ability
    const canCreateResult = await bouncer.allows('createSubscription')

    return inertia.render('dashboard/subscriptions/list', {
      subscriptions,
      canCreate: { allowed: canCreateResult },
    })
  }

  public async create({ auth, request, response, bouncer }: HttpContext) {
    const user = auth.user!

    // Use bouncer.authorize() to throw AuthorizationException if denied
    await bouncer.authorize('createSubscription')

    const { name, endpoint, cronExpression, enabled } = request.body()

    const subscription = await Subscription.create({
      name,
      endpoint,
      cronExpression,
      enabled: enabled ?? true,
      userId: user.id,
      timezone: user.timeZone || 'UTC',
      failureCount: 0,
    })

    return response.created({
      success: true,
      subscription: {
        id: subscription.id,
        nid: subscription.nid,
        name: subscription.name,
        endpoint: subscription.endpoint,
        cronExpression: subscription.cronExpression,
        enabled: subscription.enabled,
      },
    })
  }

  public async show({ auth, inertia, params }: HttpContext) {
    const subscription = await Subscription.query()
      .where('user_id', auth.user!.id)
      .andWhere('nid', params.nid)
      .orderBy('created_at', 'desc')
      .first()

    return inertia.render('dashboard/subscriptions/show', { subscription })
  }

  public async clientUpdateSubscription({ params, request, response, auth }: HttpContext) {
    const { name, enabled, endpoint, cronExpression } = request.body()
    const { nid } = params

    const user = auth.user as User
    const { id: userId } = user
    const subscription = await Subscription.query()
      .where('user_id', userId)
      .andWhere('nid', nid)
      .firstOrFail()

    subscription.name = name
    subscription.timezone = user.timeZone || 'UTC'
    subscription.enabled = enabled
    subscription.endpoint = endpoint
    subscription.cronExpression = cronExpression
    subscription.timezone = 'America/New_York'

    await subscription.save()

    return response.ok(subscription)
  }

  public async clientCronDeliveries({ request, response }: HttpContext) {
    const format = 'cccc, LLLL d, yyyy h:mm a'
    try {
      const { cron, timezone } = request.body()
      const cronExpression = parser.parseExpression(cron, { tz: timezone })
      const next5 = []
      for (let i = 0; i < 5; i++) {
        const next = cronExpression.next().toDate()
        const toTimeZone = DateTime.fromJSDate(next).setZone(timezone).toFormat(format)
        next5.push(toTimeZone)
      }
      return response.json(next5)
    } catch (e) {
      return response.badRequest({ error: 'Invalid cron expression' })
    }
  }

  public async clientTestSubscriptionEndpoint({
    params,
    request,
    response,
    auth,
    i18n,
  }: HttpContext) {
    const { nid } = params
    const { endpoint } = request.qs()

    const user = auth.user as User
    const { id: userId } = user
    // Query subscription to verify user ownership, result not needed
    await Subscription.query().where('user_id', userId).andWhere('nid', nid).firstOrFail()

    try {
      const result = await SecureDataFetcher.fetchData(
        endpoint,
        {
          timeout: 5000,
        },
        {
          i18n,
          user,
          requestId: request.id?.(),
        }
      )
      return response.ok({
        status: 'success',
        response: result.data,
        fetchStatus: result.status,
      })
    } catch (error) {
      return response.badRequest({ status: 'error', error: error.message })
    }
  }

  public async processDueSubscriptions({ response }: HttpContext) {
    try {
      // Import the job dynamically to avoid potential circular dependency issues
      const { default: ProcessDueSubscriptionsJob } = await import(
        '#jobs/process_due_subscriptions_job'
      )

      // Queue the main processing job
      await ProcessDueSubscriptionsJob.dispatch({})

      return response.ok({
        message: 'Subscription processing queued successfully',
        status: 'queued',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to queue subscription processing',
        error: error.message,
      })
    }
  }
}
