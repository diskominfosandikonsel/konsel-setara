<template>
  <q-header bordered class="bg-white text-black">
    <q-toolbar>
      <q-toolbar-title>
        <q-avatar>
          <q-icon
            name="r_chevron_left"
            size="35px"
            @click="$router.back()"
          />
        </q-avatar>
        <span class="sapa_title">Edukasi PPA</span>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>

  <q-page class="bg-white">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-pa-md">
      <q-spinner size="40px" />
    </div>

    <!-- PDF -->
    <div ref="pdfContainer" class="pdf-container"></div>
  </q-page>
</template>

<script>
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'

// ✅ set worker (IMPORTANT)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

let pdfDoc = null // ✅ NOT reactive

export default {
  data() {
    return {
      loading: true
    }
  },

  async mounted() {
    try {
      const url = 'https://konsel-setara.konaweselatankab.go.id/uploads/guide-app.pdf'

      const loadingTask = pdfjsLib.getDocument(url)
      pdfDoc = await loadingTask.promise

      const container = this.$refs.pdfContainer

      // ✅ render all pages
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)

        const viewport = page.getViewport({ scale: 1.2 })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.height = viewport.height
        canvas.width = viewport.width

        container.appendChild(canvas)

        await page.render({
          canvasContext: context,
          viewport
        }).promise
      }

    } catch (err) {
      console.error('PDF ERROR:', err)
    } finally {
      this.loading = false
    }
  }
}
</script>

<style>
.pdf-container {
  padding: 12px;
}

canvas {
  width: 100%;
  margin-bottom: 12px;
}
</style>