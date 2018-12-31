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
      headers: {
        'Authorization': localStorage.getItem('id_token')
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
    console.log(response.data)
    for (let i in response.data.data.acl_endpoints) {
      try {
        let options = {
          method: 'post',
          headers: {
            'Authorization': localStorage.getItem('id_token')
          },
          url: MICROSERVICES_API + 'api/' + response.data.data.acl_endpoints[i].service
        }
        let service = await this._vm.$axios(options)
        console.log('SERVICE: ', service)
        state.commit('addService', service)
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
