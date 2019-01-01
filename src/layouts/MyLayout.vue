<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
      >
        <q-toolbar-title>
          Microservices Manager
          <span slot="subtitle">
            Platform services
          </span>
        </q-toolbar-title>
        <q-btn flat :label="this.serviceId" icon="remove_red_eye" @click="gotoService($event)" />
        <q-btn-dropdown
          :label="this.username"
          flat
          icon="person"
         >
          <q-list link>
            <q-item v-close-overlay @click.native="signOut()">
            <q-item-side icon="assignment return" inverted color="negative" />
              <q-item-main>
                <q-item-tile label> Sign Out </q-item-tile>
              </q-item-main>
            </q-item>
            <q-item-separator inset />
          </q-list>
         </q-btn-dropdown>
      </q-toolbar>
    </q-layout-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      username: ''
    }
  },
  methods: {
    openURL,
    signOut () {
      localStorage.clear()
      location.reload()
    }
  },
  computed: {
    serviceId () {
      return this.$store.getters['services/getCurrentServiceId']
    }
  },
  mounted () {
    this.username = localStorage.getItem('username')
  }
}
</script>

<style>
</style>
