<template>
  <div class="autocomplete">
    <input
      type="text"
      :value="internalValue"
      @input="onInput"
      @focus="show = true"
      :placeholder="placeholder"
      :class="inputClass"
    />

    <ul v-if="show && filtered.length" :class="dropdownClass">
      <li
        v-for="(item, index) in filtered"
        :key="index"
        @click="selectItem(item)"
      >
        {{ displayItem(item) }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AutocompleteInput',
  props: {
    modelValue: { type: [String, Number, Object], default: '' },
    items: { type: Array, default: () => [] },
    placeholder: { type: String, default: '' },
    inputClass: { type: String, default: 'input-custom' },
    dropdownClass: { type: String, default: 'dropdown' },
    filterFn: { type: Function, default: null },
    labelKey: { type: String, default: null }
  },
  data() {
    return {
      internalValue: this.modelValue,
      show: false,
      filtered: []
    }
  },
  watch: {
    modelValue(v) {
      this.internalValue = v
    },
    items() {
      this.filterItems()
    }
  },
  methods: {
    onInput(e) {
      this.internalValue = e.target.value
      this.$emit('update:modelValue', this.internalValue)
      this.filterItems()
    },
    filterItems() {
      if (!this.internalValue) {
        this.filtered = []
        return
      }
      const q = String(this.internalValue).toLowerCase()
      if (this.filterFn) {
        this.filtered = this.items.filter(i => this.filterFn(i, q))
      } else if (this.labelKey) {
        this.filtered = this.items.filter(i => String(i[this.labelKey] || '').toLowerCase().includes(q))
      } else {
        this.filtered = this.items.filter(i => String(i).toLowerCase().includes(q))
      }
    },
    selectItem(item) {
      const val = this.labelKey && typeof item === 'object' ? item[this.labelKey] : item
      this.internalValue = val
      this.$emit('update:modelValue', val)
      this.$emit('select', item)
      this.show = false
    },
    displayItem(item) {
      return this.labelKey && typeof item === 'object' ? item[this.labelKey] : item
    },
    handleClickOutside(e) {
      if (!this.$el.contains(e.target)) this.show = false
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.autocomplete { position: relative; width: 100%; }
.input-custom { margin-top: 16px; border-radius: 8px; height: 56px; width: 100%; padding: 0 16px; border: 1px solid #C4C4C4; font-size: 12px; outline: none; }
.dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #fff; border: 1px solid #C4C4C4; border-radius: 8px; max-height: 200px; overflow-y: auto; list-style: none; padding: 8px 0; margin: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1); z-index: 9999; }
.dropdown li { padding: 12px 16px; cursor: pointer; font-size: 14px; }
.dropdown li:hover { background-color: #f5f5f5; }
</style>
