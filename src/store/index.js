import Vue from 'vue'
import Vuex from 'vuex'
import services from './services'
import serviceRegistry from './serviceRegistry'

Vue.config.silent = true
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    services,
    serviceRegistry
  }
})

export default store
