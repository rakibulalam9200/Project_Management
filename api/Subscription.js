import Api from './defaultApi'

class Subscription extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }
  getAllPaymentMethods(orgId) {
    return this.get(`/get-payment-method/${orgId}`)
  }

  getAllPlans(params) {
    return this.get(`/plan/`, params)
  }

  createCard(params) {
    return this.postFormData('/create-card', params)
  }

  attachCard(params, orgId) {
    return this.post(`/attach-card/${orgId}`, params)
  }

  subscription(params) {
    return this.post('/subscription', params)
  }

  createIntent(orgId) {
    return this.get(`/create-setup-intent/${orgId}`)
  }

  confirmIntent(intentId, params) {
    return this.post(`/setup-intents/${intentId}/confirm`, params)
  }

  check() {
    console.log('check subscription............')
    return this.get('/check-subscription')
  }

  planCheckout(params) {
    return this.post('/plan-checkout', params)
  }


  stripeCheckout(params) {
    return this.post('/stripe/checkout', params)
  }

  stripeAttachCard(params, organizationId) {
    return this.post(`/attach-card/${organizationId}`, params)
  }

  makeStripeSubscription(params) {
    return this.post('/make-subscription', params)
  }

  getPaymentMethods(organizationId, params) {
    return this.get(`/get-payment-method/${organizationId}`, params)
  }

  getSinglePaymentMethod(organizationId, payment_method, params) {
    return this.get(`/get-payment-method/${organizationId}/${payment_method}`, params)
  }

  makeDefaultPaymentMethod(params) {
    return this.post('/update-default-payment-method', params)
  }


  deletePaymentMethod(params) {
    return this.post('/delete-payment-method', params)
  }

  updatePaymentMethod(payment_method, params) {
    return this.post(`/update-card/${payment_method}`, params)
  }

  checkSubscription() {
    return this.get('/check-subscription')
  }
  stripeSuccess(params) {
    return this.get('/stripe/success', params)
  }
  stripeCancel(params) {
    return this.get('/stripe/cancel', params)
  }
  paypalCheckout(params) {
    return this.post('/paypal/checkout', params)
  }
  paypalSuccess(params) {
    return this.get('/paypal/success', params)
  }
  paypalCancel(params) {
    return this.get('/paypal/cancel', params)
  }
  getDefaultPlan(params) {
    return this.get('/get-default-plan', params)
  }

  activateTrial(params) {
    return this.post('/free-trial-activate', params)
  }

  getAllSubscriptions(params) {
    return this.get('/organization-subscription', params)
  }

  getOrgSubscription(organizationId, subscriptionId) {
    return this.get(`/organization-subscription/${organizationId}/${subscriptionId}`)
  }

  updateOrgSubscription(organizationId, subscriptionId, params) {
    console.log(params,'params.......')
    return this.post(`/organization-subscription/${organizationId}/${subscriptionId}`, params)
  }

  getPaymentHistory(params) {
    return this.get(`/subscription-payment-history`, params)
  }
}

export default Subscription
