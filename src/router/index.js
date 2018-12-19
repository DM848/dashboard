import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

import axios from 'axios'
import jwtDecode from 'jwt-decode'
import qs from 'qs'
import uuid from 'uuid'
import { COGNITO_LOGIN_ENDPOINT, APP_CLIENT_ID, COGNITO_REDIRECT_URI, COGNITO_VALIDATE_CODE_ENDPOINT } from '../config'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    if (to.meta.requireAuth) {
      if (localStorage.getItem('access_token') === null) {
        if (localStorage.getItem('state') === null) {
          localStorage.setItem('state', uuid.v4())
        }
        if (location.href.indexOf('code') > -1) {
          if (atob(gup('state', location.href)) !== localStorage.getItem('state')) {
            console.log('XSRF detected!')
            localStorage.clear()
            window.location = COGNITO_LOGIN_ENDPOINT + '&state=' + btoa(window.localStorage.getItem('state'))
          } else {
            requestTokens(next)
          }
        } else {
          window.location = COGNITO_LOGIN_ENDPOINT + '&state=' + btoa(window.localStorage.getItem('state'))
        }
      } else {
        next()
      }
    }
  })

  return Router
}

function gup (name, url) {
  if (!url) url = decodeURI(location.href)
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
  var regexS = name + '=([^&#]*)'
  var regex = new RegExp(regexS)
  var results = regex.exec(url)
  return results == null ? null : results[1]
}

async function requestTokens (next) {
  let data = {
    'grant_type': 'authorization_code',
    'client_id': APP_CLIENT_ID,
    'code': gup('code', location.href),
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
    console.log('Validation Code Authorized - Access Tokens Received!')
    next()
  } catch (err) {
    console.log(err)
  }
}
