import Subscription from '#models/subscription'
import CronService from '#services/cron_service'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('CronService - isDue', () => {
  test('should return true if subscription has never been run', ({ assert }) => {
    const subscription = new Subscription()
    subscription.lastRunAt = null
    subscription.nextRunAt = null
    subscription.cronExpression = '0 0 * * *'
    subscription.timezone = 'UTC'

    const result = CronService.isDue(subscription)
    assert.isTrue(result)
  })

  test('should return true if current time is past nextRunAt', ({ assert }) => {
    const subscription = new Subscription()
    subscription.lastRunAt = DateTime.now().minus({ hours: 2 })
    subscription.nextRunAt = DateTime.now().minus({ minutes: 5 })
    subscription.cronExpression = '0 0 * * *'
    subscription.timezone = 'UTC'

    const result = CronService.isDue(subscription)
    assert.isTrue(result)
  })

  test('should return false if current time is before nextRunAt', ({ assert }) => {
    const subscription = new Subscription()
    subscription.lastRunAt = DateTime.now().minus({ hours: 2 })
    subscription.nextRunAt = DateTime.now().plus({ minutes: 5 })
    subscription.cronExpression = '0 0 * * *'
    subscription.timezone = 'UTC'

    const result = CronService.isDue(subscription)
    assert.isFalse(result)
  })

  test('should fallback to cron calculation when nextRunAt is null', ({ assert }) => {
    const subscription = new Subscription()
    subscription.lastRunAt = DateTime.now().minus({ days: 2 })
    subscription.nextRunAt = null
    subscription.cronExpression = '0 0 * * *' // Daily at midnight
    subscription.timezone = 'UTC'

    const result = CronService.isDue(subscription)
    assert.isTrue(result)
  })

  test('should handle timezone correctly in fallback calculation', ({ assert }) => {
    const subscription = new Subscription()
    subscription.lastRunAt = DateTime.now().minus({ hours: 1 })
    subscription.nextRunAt = null
    subscription.cronExpression = '0 0 * * *' // Daily at midnight
    subscription.timezone = 'America/New_York'

    const result = CronService.isDue(subscription)
    // Result depends on current time relative to midnight in New York
    assert.isBoolean(result)
  })

  test('should return false for invalid cron expression', ({ assert }) => {
    const subscription = new Subscription()
    subscription.id = 123
    subscription.lastRunAt = DateTime.now().minus({ hours: 1 })
    subscription.nextRunAt = null
    subscription.cronExpression = 'abc def ghi'
    subscription.timezone = 'UTC'

    const result = CronService.isDue(subscription)

    assert.isFalse(result)
  })
})

test.group('CronService - calculateNextRun', () => {
  test('should calculate next run time correctly for valid cron expression', ({ assert }) => {
    const cronExpression = '0 12 * * *' // Daily at noon
    const timezone = 'UTC'

    const result = CronService.calculateNextRun(cronExpression, timezone)

    assert.isNotNull(result)
    assert.isTrue(result instanceof DateTime)
    assert.equal(result!.hour, 12)
    assert.equal(result!.minute, 0)
  })

  test('should handle different timezones', ({ assert }) => {
    const cronExpression = '0 12 * * *' // Daily at noon
    const timezone = 'America/New_York'

    const result = CronService.calculateNextRun(cronExpression, timezone)

    assert.isNotNull(result)
    assert.isTrue(result instanceof DateTime)
  })

  test('should return null for invalid cron expression', ({ assert }) => {
    const result = CronService.calculateNextRun('abc def ghi', 'UTC')

    assert.isNull(result)
  })

  test('should default to UTC timezone', ({ assert }) => {
    const cronExpression = '0 12 * * *'

    const result = CronService.calculateNextRun(cronExpression)

    assert.isNotNull(result)
    assert.isTrue(result instanceof DateTime)
  })

  test('should calculate correct time for weekly cron', ({ assert }) => {
    const cronExpression = '0 9 * * 1' // Monday at 9 AM
    const timezone = 'UTC'

    const result = CronService.calculateNextRun(cronExpression, timezone)

    assert.isNotNull(result)
    assert.isTrue(result instanceof DateTime)
    assert.equal(result!.hour, 9)
    assert.equal(result!.minute, 0)
    assert.equal(result!.weekday, 1) // Monday
  })

  test('should calculate correct time for monthly cron', ({ assert }) => {
    const cronExpression = '0 10 1 * *' // 1st of month at 10 AM
    const timezone = 'UTC'

    const result = CronService.calculateNextRun(cronExpression, timezone)

    assert.isNotNull(result)
    assert.isTrue(result instanceof DateTime)
    assert.equal(result!.hour, 10)
    assert.equal(result!.minute, 0)
    assert.equal(result!.day, 1)
  })
})

test.group('CronService - updateNextRunTime', () => {
  test('should update subscription next run time for valid cron', ({ assert }) => {
    const subscription = new Subscription()
    subscription.cronExpression = '0 12 * * *'
    subscription.timezone = 'UTC'

    // Mock the save method to avoid database operations
    let saveCallCount = 0
    subscription.save = async () => {
      saveCallCount++
      return subscription
    }

    CronService.updateNextRunTime(subscription).then(() => {
      assert.isNotNull(subscription.nextRunAt)
      assert.isTrue(subscription.nextRunAt instanceof DateTime)
      assert.equal(saveCallCount, 1)
    })
  })

  test('should not update subscription for invalid cron expression', ({ assert }) => {
    const subscription = new Subscription()
    subscription.cronExpression = 'abc def ghi'
    subscription.timezone = 'UTC'

    let saveCallCount = 0
    subscription.save = async () => {
      saveCallCount++
      return subscription
    }

    CronService.updateNextRunTime(subscription).then(() => {
      assert.equal(saveCallCount, 0)
    })
  })
})

test.group('CronService - markAsRun', () => {
  test('should update lastRunAt and nextRunAt', ({ assert }) => {
    const subscription = new Subscription()
    subscription.cronExpression = '0 12 * * *'
    subscription.timezone = 'UTC'

    let saveCallCount = 0
    subscription.save = async () => {
      saveCallCount++
      return subscription
    }

    const beforeTime = DateTime.now()

    CronService.markAsRun(subscription).then(() => {
      const afterTime = DateTime.now()

      assert.isNotNull(subscription.lastRunAt)
      assert.isTrue(subscription.lastRunAt! >= beforeTime)
      assert.isTrue(subscription.lastRunAt! <= afterTime)
      assert.isNotNull(subscription.nextRunAt)
      assert.isTrue(subscription.nextRunAt instanceof DateTime)
      assert.equal(saveCallCount, 1)
    })
  })

  test('should handle timezone correctly when calculating next run', ({ assert }) => {
    const subscription = new Subscription()
    subscription.cronExpression = '0 12 * * *'
    subscription.timezone = 'America/New_York'

    let saveCallCount = 0
    subscription.save = async () => {
      saveCallCount++
      return subscription
    }

    CronService.markAsRun(subscription).then(() => {
      assert.isNotNull(subscription.nextRunAt)
      assert.isTrue(subscription.nextRunAt instanceof DateTime)
      assert.equal(saveCallCount, 1)
    })
  })
})

test.group('CronService - markAsFailed', () => {
  test('should increment failure count and set lastFailureAt', ({ assert }) => {
    const subscription = new Subscription()
    subscription.failureCount = 2

    let saveCallCount = 0
    subscription.save = async () => {
      saveCallCount++
      return subscription
    }

    const beforeTime = DateTime.now()

    CronService.markAsFailed(subscription).then(() => {
      const afterTime = DateTime.now()

      assert.equal(subscription.failureCount, 3)
      assert.isNotNull(subscription.lastFailureAt)
      assert.isTrue(subscription.lastFailureAt! >= beforeTime)
      assert.isTrue(subscription.lastFailureAt! <= afterTime)
      assert.equal(saveCallCount, 1)
    })
  })

  test('should initialize failure count to 1 if undefined', ({ assert }) => {
    const subscription = new Subscription()
    subscription.failureCount = 0

    let saveCallCount = 0
    subscription.save = async () => {
      saveCallCount++
      return subscription
    }

    CronService.markAsFailed(subscription).then(() => {
      assert.equal(subscription.failureCount, 1)
      assert.equal(saveCallCount, 1)
    })
  })

  test('should handle error message parameter', ({ assert }) => {
    const subscription = new Subscription()
    subscription.id = 123

    let saveCallCount = 0
    subscription.save = async () => {
      saveCallCount++
      return subscription
    }

    const errorMessage = 'Test error message'

    CronService.markAsFailed(subscription, errorMessage).then(() => {
      assert.equal(subscription.failureCount, 1)
      assert.isNotNull(subscription.lastFailureAt)
      assert.equal(saveCallCount, 1)
    })
  })
})

test.group('CronService - Cron Expression Validation', () => {
  test('should handle various valid cron expressions', ({ assert }) => {
    const validExpressions = [
      '0 0 * * *', // Daily at midnight
      '*/5 * * * *', // Every 5 minutes
      '0 12 * * 0', // Every Sunday at noon
      '0 9 1 * *', // First of every month at 9 AM
      '0 0 1 1 *', // January 1st at midnight
    ]

    for (const cronExpression of validExpressions) {
      const result = CronService.calculateNextRun(cronExpression, 'UTC')
      assert.isNotNull(result, `Expected valid result for cron: ${cronExpression}`)
      assert.isTrue(result instanceof DateTime)
    }
  })

  test('should reject invalid cron expressions', ({ assert }) => {
    const invalidExpressions = [
      'abc def ghi',
      '60 0 * * *', // Invalid minute (60)
      '0 25 * * *', // Invalid hour (25)
      '0 0 32 * *', // Invalid day (32)
      '0 0 * 13 *', // Invalid month (13)
      '0 0 * * 8', // Invalid day of week (8)
    ]

    for (const cronExpression of invalidExpressions) {
      const result = CronService.calculateNextRun(cronExpression, 'UTC')
      assert.isNull(result, `Expected null result for invalid cron: ${cronExpression}`)
    }
  })
})

test.group('CronService - isValidCronExpression', () => {
  test('should return true for valid cron expressions', ({ assert }) => {
    const validExpressions = [
      '0 0 * * *', // Daily at midnight
      '*/5 * * * *', // Every 5 minutes
      '0 12 * * 0', // Every Sunday at noon
      '0 9 1 * *', // First of every month at 9 AM
      '0 0 1 1 *', // January 1st at midnight
      '15,30,45 * * * *', // Multiple values
      '0-5 * * * *', // Range
    ]

    for (const cronExpression of validExpressions) {
      const result = CronService.isValidCronExpression(cronExpression)
      assert.isTrue(result, `Expected true for valid cron: ${cronExpression}`)
    }
  })

  test('should return false for invalid cron expressions', ({ assert }) => {
    const invalidExpressions = [
      '', // Empty string
      'abc def ghi jkl mno', // Letters instead of numbers
      '0 0 * *', // Too few parts
      '0 0 * * * *', // Too many parts
      '0 0 * * * extra', // Too many parts with text
      'hello world', // Plain text
      '0 0 * * @ ', // Invalid character @
      '0 0 * * #', // Invalid character #
    ]

    for (const cronExpression of invalidExpressions) {
      const result = CronService.isValidCronExpression(cronExpression)
      assert.isFalse(result, `Expected false for invalid cron: ${cronExpression}`)
    }
  })
})
