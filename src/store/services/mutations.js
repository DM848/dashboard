export const setServices = (state, services) => {
  state.services = services
}

export const addService = (state, service) => {
  state.services.push(service)
}

export const getCurrentServiceId = (state, serviceId) => {
  state.currentServiceId = serviceId
}
