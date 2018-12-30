import { MICROSERVICES_API } from '../../config'

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
      url: MICROSERVICES_API + 'api/service'
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
    console.log(response)
    for (let i in response.data.acl_endpoints) {
      let service = await this._vm.$axios.get(MICROSERVICES_API + 'api/' + response.data.acl_endpoints[i].service)
      state.commit('addService', service)
    }
    return true
  } catch (err) {
    console.log(err)
    this._vm.$handleError(err, 'services/fetchServices')
    return false
  }
}
