<template>
  <q-select
    ref="selectRef"
    filled
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    use-input
    hide-selected
    fill-input
    input-debounce="300"
    :options="options"
    @filter="handleFilter"
    @focus="handleFocus"
    :label="label"
    option-value="id"
    option-label="uraian"
    emit-value
    map-options
    style="width: 100%; padding-bottom: 32px"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">Mulai mengetik untuk mencari...</q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.uraian }}</q-item-label>
          <q-item-label caption>Kode: {{ scope.opt[codeFieldName] }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:selected-item="scope">
      <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
    </template>
  </q-select>
</template>

<script>
export default {
  name: 'AdministrativeSelect',
  props: {
    modelValue: {
      type: [String, Number],
      default: null
    },
    label: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      default: () => []
    },
    onFilter: {
      type: Function,
      required: true
    },
    codeFieldName: {
      type: String,
      default: 'kd_kabupaten'
    }
  },
  emits: ['update:modelValue'],
  methods: {
    handleFilter(val, update) {
    //   console.log('AdministrativeSelect @filter triggered:', { val, optionsCount: this.options.length })
      
      if (typeof this.onFilter === 'function') {
        this.onFilter(val, update)
      } else {
        console.warn('onFilter is not a function!')
      }
    },
    handleFocus() {
    //   console.log('AdministrativeSelect @focus triggered')
      // Optional: Trigger initial load on focus
      if (this.options.length === 0 && typeof this.onFilter === 'function') {
        this.onFilter('', (callback) => callback())
      }
    }
  }
}
</script>

<style scoped>
</style>
