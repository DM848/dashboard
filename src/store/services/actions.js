import { MICROSERVICES_API } from '../../config'

export async function deployJolieService (state, {name, author, port, desc, privacy, replicas, lang, tags}) {
  try {
    const options = {
      method: 'POST',
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
      headers: { 'Authorization': localStorage.getItem('id_token') },
      url: MICROSERVICES_API + '/api/service-generator'
    }
    let response = await this._vm.$axios(options)
    state.commit('addService', response.data.service)
    this._vm.$q.notify({
      color: 'positive',
      position: 'bottom',
      message: response.data.message,
      icon: 'done'
    })
    return true
  } catch (err) {
    this._vm.$handleError(err, '/services/deployJolieService', {name: name})
    return false
  }
}
