<template>
  <div>
    <!-- Kabupaten -->
    <AdministrativeSelect
      :model-value="modelValue.kabupaten"
      @update:model-value="$emit('update:modelValue', { ...modelValue, kabupaten: $event })"
      label="Kabupaten"
      :options="optionsKabupaten"
      :on-filter="onFilterKabupaten"
      code-field-name="kd_kabupaten"
    />

    <!-- Kecamatan -->
    <AdministrativeSelect
      :model-value="modelValue.kecamatan"
      @update:model-value="$emit('update:modelValue', { ...modelValue, kecamatan: $event })"
      label="Kecamatan"
      :options="optionsKecamatan"
      :on-filter="onFilterKecamatan"
      code-field-name="kd_kecamatan"
    />

    <!-- Desa/Kelurahan -->
    <AdministrativeSelect
      :model-value="modelValue.desaKelurahan"
      @update:model-value="$emit('update:modelValue', { ...modelValue, desaKelurahan: $event })"
      label="Desa/Kelurahan"
      :options="optionsDesaKelurahan"
      :on-filter="onFilterDesaKelurahan"
      code-field-name="kd_desa_kelurahan"
    />
  </div>
</template>

<script>
import AdministrativeSelect from './AdministrativeSelect.vue'

export default {
  name: 'AdministrativeSelectGroup',
  components: {
    AdministrativeSelect
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      validator: (obj) => {
        return 'kabupaten' in obj && 'kecamatan' in obj && 'desaKelurahan' in obj
      }
    },
    optionsKabupaten: {
      type: Array,
      default: () => []
    },
    optionsKecamatan: {
      type: Array,
      default: () => []
    },
    optionsDesaKelurahan: {
      type: Array,
      default: () => []
    },
    onFilterKabupaten: {
      type: Function,
      required: true
    },
    onFilterKecamatan: {
      type: Function,
      required: true
    },
    onFilterDesaKelurahan: {
      type: Function,
      required: true
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
</style>
