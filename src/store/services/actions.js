import { MICROSERVICES_API, DASHBOARD_TEST_CONTENT } from '../../config'

export async function deployNewService (state, { name, author, port, desc, privacy, replicas, lang, tags }) {
  try {
    const options = {
      method: 'post',
      data: {
        name: name,
        author: author,
        port: port,
        desc: desc,
        public: privacy,
        replicas: replicas,
        lang: lang,
        tags: tags
      },
      headers: {
        'jwt': localStorage.getItem('id_token')
      },
      url: MICROSERVICES_API + 'api/service-generator/service'
    }
    let response = await this._vm.$axios(options)
    console.log(options)
    console.log(response)
    state.commit('addService', response.data.service)
    this._vm.$q.notify({
      color: 'positive',
      position: 'bottom',
      message: response.data.message,
      icon: 'done'
    })
    return true
  } catch (err) {
    console.log(err)
    this._vm.$handleError(err, 'services/deployService', { name: name })
    return false
  }
}

export async function fetchServices (state) {
  try {
    let response = await this._vm.$axios.get(MICROSERVICES_API + 'configuration')
    console.log(response.data)
    for (let i in response.data.data.acl_endpoints) {
      try {
        let options = {
          method: 'get',
          headers: {
            'jwt': localStorage.getItem('id_token')
          },
          url: MICROSERVICES_API + 'api/' + response.data.data.acl_endpoints[i].service
        }
        let service = await this._vm.$axios(options)
        console.log('SERVICE: ', service)
        if (service.status === 'success') {
          state.commit('addService', service.data.service)
        }
      } catch (err) {
        console.log(err)
      }
    }
    console.log('STATE: ', state)
    return true
  } catch (err) {
    console.log(err)
    this._vm.$handleError(err, 'services/fetchServices')
    return false
  }
}

export async function fetchTestServices (state) {
  try {
    let response = await this._vm.$axios.get(DASHBOARD_TEST_CONTENT)
    console.log(response.data)
    for (let i in response.data.services) {
      try {
        if (response.data.services[i].status === 'success') {
          state.commit('addService', response.data.services[i].data.service)
          if (response.data.services[i].data.service.author === localStorage.getItem('username')) {
            state.commit('addOwnService', response.data.services[i].data.service)
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
    return true
  } catch (err) {
    console.log(err)
    this._vm.$handleError(err, 'services/fetchTestServices')
    return false
  }
}
