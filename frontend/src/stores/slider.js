import { defineStore } from 'pinia'
import { SliderService } from 'src/services/slider.service'

export const useSliderStore = defineStore('slider', {
  state: () => ({
    sliders: [],
    loading: false
  }),

  actions: {
    async fetchSliders() {
      this.loading = true
      try {
        const res = await SliderService.getAll()
        this.sliders = res.data?.data || []
        return res.data
      } catch (err) {
        console.error('fetchSliders error:', err)
        return { data: [] }
      } finally {
        this.loading = false
      }
    },

    async createSlider(fd) {
      this.loading = true
      try {
        const res = await SliderService.create(fd)
        return res.data
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateSlider(id, fd) {
      this.loading = true
      try {
        const res = await SliderService.update(id, fd)
        return res.data
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },

    async removeSlider(id) {
      this.loading = true
      try {
        const res = await SliderService.remove(id)
        return res.data
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
