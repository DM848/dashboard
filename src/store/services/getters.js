export const getServices = (state) => {
  return state.services
}

export const getCurrentServiceId = (state) => {
  return state.currentServiceId
}

export const getDashboardData = (state) => (serviceType) => {
  if (serviceType === 'all') {
    return state.services
  } else return state.ownServices
}
