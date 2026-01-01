/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| You may export multiple abilities from this file and pre-register them
| when creating the Bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import { Bouncer } from '@adonisjs/bouncer'
import PrivilegeService from '#services/privilege_service'
import type User from '#models/user'

/**
 * Check if user can create a new subscription
 */
export const createSubscription = Bouncer.ability(async (user: User) => {
  const result = await PrivilegeService.canCreateSubscription(user)

  if (!result.allowed) {
    throw new Error(
      result.reason || 'You have reached your subscription limit for your current tier'
    )
  }

  return true
})

/**
 * Check if user can send emails (daily limit check)
 */
export const sendEmail = Bouncer.ability(async (user: User) => {
  const result = await PrivilegeService.canReceiveEmail(user)

  if (!result.allowed) {
    throw new Error(result.reason || 'Email sending limit reached for your current tier')
  }

  return true
})

/**
 * Check if user can view email history
 */
export const viewEmailHistory = Bouncer.ability(async (user: User) => {
  const result = await PrivilegeService.canViewEmailHistory(user)

  if (!result.allowed) {
    return false
    // throw new Error(result.reason || 'Email history viewing requires a paid subscription')
  }

  return true
})

/**
 * Check if user can export data
 */
export const exportData = Bouncer.ability(async (user: User) => {
  const result = await PrivilegeService.canExportData(user)

  if (!result.allowed) {
    throw new Error(result.reason || 'Data export requires a paid subscription')
  }

  return true
})

/**
 * Check if user can view their own subscription
 */
export const viewSubscription = Bouncer.ability(async (user: User, subscription: any) => {
  return subscription.userId === user.id
})

/**
 * Check if user can edit their own subscription
 */
export const editSubscription = Bouncer.ability(async (user: User, subscription: any) => {
  return subscription.userId === user.id
})

/**
 * Check if user can delete their own subscription
 */
export const deleteSubscription = Bouncer.ability(async (user: User, subscription: any) => {
  return subscription.userId === user.id
})

/**
 * Check if user can view their own email
 */
export const viewEmail = Bouncer.ability(async (user: User, email: any) => {
  return email.userId === user.id
})
