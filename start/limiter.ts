/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

export const loginThrottle = limiter.define('login', () => {
  return limiter
    .allowRequests(5)
    .every('10 seconds')
    .limitExceeded((error) => {
      error.t('messages.errors.rate_limited', {
        limit: error.response.limit,
        remaining: error.response.remaining,
      })
    })
})

export const testSubscriptionEndpointThrottle = limiter.define('test-subscription-endpoint', () => {
  return limiter
    .allowRequests(1)
    .every('10 seconds')
    .limitExceeded((error) => {
      error.t('messages.errors.rate_limited', {
        limit: error.response.limit,
        remaining: error.response.remaining,
      })
    })
})
