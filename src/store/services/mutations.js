/* export const setServices = (state, services) => {
  state.services = services
} */

export const addService = (state, service) => {
  state.services.push(service)
}

export const addOwnService = (state, service) => {
  state.ownServices.push(service)
}

export const setCurrentServiceId = (state, serviceId) => {
  state.currentServiceId = serviceId
}
