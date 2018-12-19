import { APP_CLIENT_ID, COGNITO_REDIRECT_URI, COGNITO_VALIDATE_CODE_ENDPOINT } from '../config'
import axios from 'axios'
import jwtDecode from 'jwt-decode'
import qs from 'qs'
import store from '../store'
import { Notify } from 'quasar'

export default ({ Vue }) => {
  Vue.prototype.$handleError = handleError
}

function handleError (error, action, input) {
  if (error.toString().includes('401')) {
    let token = JSON.parse(localStorage.getItem('id_token_decoded'))
    let now = new Date()
    if (token.exp < now / 1000) {
      requestNewTokens(action, input)
    } else {
      Notify.create({color: 'negative', icon: 'report_problem', position: 'bottom', message: 'You are not authorized to perform this action.'})
    }
  } else {
    console.log('ERROR: ', error)
    Notify.create({color: 'negative', icon: 'report_problem', position: 'bottom', message: error.response.data.userError})
  }
}

async function requestNewTokens (action, input) {
  let data = {
    'grant_type': 'refresh_token',
    'client_id': APP_CLIENT_ID,
    'refresh_token': localStorage.getItem('refresh_token'),
    'redirect_uri': COGNITO_REDIRECT_URI
  }
  let options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data),
    url: COGNITO_VALIDATE_CODE_ENDPOINT
  }
  try {
    let response = await axios(options)
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('id_token', response.data.id_token)
    localStorage.setItem('id_token_decoded', JSON.stringify(jwtDecode(response.data.id_token)))
    localStorage.setItem('username', JSON.parse(localStorage.getItem('id_token_decoded'))['cognito:username'])
    localStorage.setItem('cognito_groups', JSON.parse(localStorage.getItem('id_token_decoded'))['cognito:groups'])
    if (response.data.refresh_token !== undefined) localStorage.setItem('refresh_token', response.data.refresh_token)
    console.log('Access Tokens refreshed! Retrying original method request.')
    store.dispatch(action, input)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}
