<template>
  <q-page style="padding: 2%">
    <div>
    <q-table
      color="primary"
      :data="services"
      :columns="columns"
      selection="multiple"
      :selected.sync="selected"
      :loading="tableLoading"
      :filter="filter"
      title="MicroServices"
      row-key="serviceId"
      :pagination.sync="pagination"
    >
      <template slot="top-left" slot-scope="props">
        <q-search
          inverted
          hide-underline
          color="primary"
          v-model="filter"
          autofocus
        />
      </template>
      <template v-if="selected.length !== 0" slot="top-right" slot-scope="props">
        <q-btn v-if="validatePermissions() && selected.length === 1" color="warning" flat round delete icon="mdi-rename-box" @click="updateSiteModal.show()" >
          <q-tooltip>
            Update
          </q-tooltip>
        </q-btn>
        <q-btn v-else-if="selected.length === 1" disable color="warning" flat round delete icon="mdi-rename-box" @click="updateSiteModal.show()" >
          <q-tooltip>
            Rename
          </q-tooltip>
        </q-btn>
        <q-modal v-model="updateSiteOpened" :content-css="{padding: '50px', minWidth: '50vw'}" @show="$refs.updateSiteInput.focus()" >
          <div class="q-display-1 q-mb-md">Update Site Name</div>
          <q-input v-model="updatedSiteName" placeholder="Site Name" ref="updateSiteInput" />
          <br>
          <div id="modal-buttons">
            <q-btn color="negative" @click="updateSiteModal.hide()" label="Cancel" icon="cancel" />
            <q-btn color="positive" @click="updateSiteName(selected[0])" label="Update" icon="done" :loading="updateSiteLoading" />
          </div>
        </q-modal>
        <q-btn v-if="validatePermissions()" color="negative" flat round delete icon="delete" @click="deleteRowAlert.handler(selected)" >
          <q-tooltip>
            Delete
          </q-tooltip>
        </q-btn>
        <q-btn v-else disable color="negative" flat round delete icon="delete" @click="deleteRowAlert.handler(selected)" >
          <q-tooltip>
            Delete
          </q-tooltip>
        </q-btn>
      </template>
      <q-tr slot="body" slot-scope="props" :props="props" @click.native="serviceClicked(props.row.serviceId)" style="cursor: pointer;">
        <q-td auto-width style="pointer-events: none">
          <q-checkbox color="primary" v-model="props.selected" style="pointer-events: auto"/>
        </q-td>
        <q-td key="name" :props="props">{{ props.row.name }}
        </q-td>
        <q-td key="author" :props="props">{{ props.row.createdBy }}
          <q-icon name="person" color="primary" size="22px"/>
        </q-td>
        <q-td key="createdAt" :props="props">{{ props.row.createdAt }}
          <q-icon name="date range" color="primary" size="22px"/>
        </q-td>
        <q-td key="description" :props="props">{{ props.row.description }}
        </q-td>
        <q-td key="public" :props="props">{{ props.row.public }}
        </q-td>
        <q-td key="replicas" :props="props">{{ props.row.replicas }}
        </q-td>
        <q-td key="language" :props="props">{{ props.row.language }}
        </q-td>
      </q-tr>
    </q-table>
    <br>
    <div id="button">
      <q-btn color="primary" icon="remove_red_eye" label="Deploy New Service" @click="deployServiceModal.show()" :loading="deployServiceLoading"/>
    </div>
    <q-modal v-model="deployServiceOpened" :content-css="{padding: '50px', minWidth: '50vw'}" @keyup.enter="deployService()">
      <div class="q-display-1 q-mb-md">Deploy a new service!</div>
      <q-input v-model="newServiceName" float-label="Name of the service" />
      <br>
      <q-input v-model="description" float-label="Description of the service" />
      <br>
      <q-input v-model="tags" float-label="Tags" placeholder="Tags" />
      <br>
      <q-option-group type="radio" v-model="privacy" :options="[{ label: 'Public', value: true }, { label: 'Private', value: false }]" />
      <br>
      <q-collapsible v-model="open" label="Advanced settings">
        <div>
          <q-input v-model="portNumber" float-label="Port number" type="number" />
          <br>
          <q-input v-model="replicasAmount" float-label="Amount of replicas" type="number" />
          <br>
          <q-select v-model="language" float-label="Language" radio :options="[{ label: 'Jolie', value: 'jolie' }, { label: 'Go', value: 'golang' }]" />
        </div>
      </q-collapsible>
      <br>
      <div id="modal-buttons">
        <q-btn color="negative" @click="deployServiceModal.hide()" label="Cancel" icon="cancel" />
        <q-btn color="positive" @click="deployService()" label="Deploy" icon="done" :loading="deployServiceLoading" />
      </div>
    </q-modal>
    </div>
  </q-page>
</template>

<style>
#button {
  display: flex;
  justify-content: flex-end;
}
#modal-buttons {
  display: flex;
  justify-content: space-between;
}
</style>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      tableLoading: false,
      deployServiceLoading: false,
      filter: '',
      pagination: {
        rowsPerPage: 20
      },
      columns: [
        { name: 'name', label: 'Name', field: 'name', sortable: true },
        { name: 'author', label: 'Author', field: 'author', sortable: true },
        { name: 'createdAt', label: 'Created At', field: 'createdAt', sortable: true },
        { name: 'description', label: 'Description', field: 'description', sortable: true },
        { name: 'public', label: 'Publicity', field: 'public', sortable: true },
        { name: 'replicas', label: 'Replicas', field: 'replicas', sortable: true },
        { name: 'language', label: 'Language', field: 'language', sortable: true }
      ],
      selected: [],
      deployServiceOpened: false,
      deployServiceModal: {
        show: () => {
          this.deployServiceOpened = true
          this.startEventListener()
        },
        hide: () => {
          this.deployServiceOpened = false
          this.stopEventListener()
        }
      },
      newServiceName: '',
      author: localStorage.getItem('username'),
      description: '',
      tags: [],
      privacy: false,
      portNumber: 8888,
      replicasAmount: 1,
      language: 'jolie'
    }
  },
  methods: {
    deployService () {
      this.$store.dispatch('services/deployNewService', { name: this.newServiceName, author: this.author, port: this.portNumber, desc: this.description, privacy: this.privacy, replicas: this.replicasAmount, lang: this.language, tags: this.tags })
    },
    fetchServices () {
      this.$store.dispatch('services/fetchServices')
    },
    async serviceClicked (serviceId) {
      await this.$store.commit('sites/setCurrentServiceId', serviceId)
      this.$router.push('/services/' + serviceId)
      this.$root.$emit('service_changed')
    },
    startEventListener () {
      window.addEventListener('keyup', this.enterEventHandler)
    },
    stopEventListener () {
      window.removeEventListener('keyup', this.enterEventHandler)
    },
    enterEventHandler (event) {
      if (event.keyCode === 13 && !this.deployServiceLoading) {
        this.deployServiceLoading = true
        this.stopEventListener()
        this.deployService()
      }
    }
  },
  computed: {
    services () {
      return this.$store.getters['sites/getServices']
    }
  },
  created () {
    this.$router.replace('/')
    this.fetchServices()
  }
}
</script>
