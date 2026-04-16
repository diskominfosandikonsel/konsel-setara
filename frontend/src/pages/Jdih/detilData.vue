<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer"
                            @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Detil Data</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md">
                <div v-if="loading" class="flex flex-center q-pa-xl">
                    <q-spinner-dots color="primary" size="40px" />
                </div>
                <q-card v-else-if="jdih.detailProduk" flat class="bg-white rounded-borders shadow-1 mulish">
                    <q-list separator>
                        <q-item class="q-py-md">
                            <q-item-section class="col-4">
                                <q-item-label class="text-weight-bold text-caption text-grey-9">Judul</q-item-label>
                            </q-item-section>
                            <q-item-section class="col-8">
                                <q-item-label class="text-caption text-grey-10">
                                    {{ jdih.detailProduk.nama }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item class="q-py-md">
                            <q-item-section class="col-4">
                                <q-item-label class="text-weight-bold text-caption text-grey-9">Nomor Peraturan</q-item-label>
                            </q-item-section>
                            <q-item-section class="col-8">
                                <q-item-label class="text-caption text-grey-10">Nomor {{ jdih.detailProduk.nomor }} Tahun {{ jdih.detailProduk.tahun }}</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item class="q-py-md">
                            <q-item-section class="col-4">
                                <q-item-label class="text-weight-bold text-caption text-grey-9">Jenis Peraturan</q-item-label>
                            </q-item-section>
                            <q-item-section class="col-8">
                                <q-item-label class="text-caption text-grey-10">
                                    {{ jdih.detailProduk.jenis }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item class="q-py-md">
                            <q-item-section class="col-4">
                                <q-item-label class="text-weight-bold text-caption text-grey-9">Tempat Terbit</q-item-label>
                            </q-item-section>
                            <q-item-section class="col-8">
                                <q-item-label class="text-caption text-grey-10">
                                    {{ jdih.detailProduk.tempat_terbit || 'Andoolo' }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item class="q-py-md">
                            <q-item-section class="col-4">
                                <q-item-label class="text-weight-bold text-caption text-grey-9">Status Peraturan</q-item-label>
                            </q-item-section>
                            <q-item-section class="col-8">
                                <!-- <q-item-label>
                                    <q-chip v-if="jdih.detailProduk.status === 'Aktif'" color="positive" text-color="white" dense class="text-weight-bolder text-caption">Berlaku</q-chip>
                                    <q-chip v-else color="negative" text-color="white" dense class="text-weight-bolder text-caption">Tidak Berlaku</q-chip>
                                </q-item-label> -->

                                <div v-if="jdih.detailProduk.status === 'Aktif' || item.status === 'Berlaku'" class="text-caption text-grey-10">
                                    Berlaku
                                </div>
                                <div v-else class="text-caption text-grey-10">
                                    Tidak Berlaku
                                </div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card>
                <div v-if="jdih.detailProduk && jdih.detailProduk.file" class="q-mt-lg">
                    <div class="text-subtitle2 q-mb-sm text-grey-8 mulish">Pratinjau Dokumen:</div>
                    
                    <q-card flat bordered class="pdf-viewer-wrapper shadow-2">
                        <div v-if="renderingPdf" class="flex flex-center q-pa-lg">
                            <q-spinner-ios color="primary" size="30px" />
                            <div class="q-ml-md text-caption">Memuat halaman...</div>
                        </div>

                        <div ref="pdfContainer" class="pdf-render-container"></div>
                    </q-card>
                    <q-btn color="primary" class="full-width q-mt-md mulish" icon="download" label="Unduh Dokumen" @click="downloadFile(jdih.detailProduk.file)" />
                </div>
                <div v-else-if="!loading && !jdih.detailProduk" class="text-center q-pa-xl text-grey-7 mulish">
                    <q-icon name="error_outline" size="60px" />
                    <div class="text-subtitle1 q-mt-md">Data Tidak Ditemukan</div>
                    <div class="text-caption q-mb-md">ID tidak ada di URL atau halaman di-refresh.</div>
                    <q-btn color="primary" flat label="Kembali ke Daftar" @click="$router.back()" />
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { useJdihStore } from 'stores/jdih'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
let pdfDoc = null

export default {
    data() {
        return {
            loading: false,
            renderingPdf: false

        }
    },
    computed: {
        jdih() {
            return useJdihStore()
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        async initData() {
            const id = this.$route.query.id
            if (id) {
                this.loading = true
                await this.jdih.fetchDetailProduk(id)
                this.loading = false

                if (this.jdih.detailProduk && this.jdih.detailProduk.file) {
                    this.$nextTick(() => {
                        this.renderPdf(this.jdih.detailProduk.file)
                    })
                }
            }
        },
        async renderPdf(fileName) {
            this.renderingPdf = true
            try {
                const url = `https://server.jdih.konaweselatankab.go.id/uploads/peraturan/${fileName}`
                
                const loadingTask = pdfjsLib.getDocument(url)
                pdfDoc = await loadingTask.promise
                
                const container = this.$refs.pdfContainer
                if (!container) return
                container.innerHTML = '' // Bersihkan container

                // Loop setiap halaman
                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    const page = await pdfDoc.getPage(i)
                    
                    // Hitung skala agar pas dengan lebar kontainer layar HP
                    const unscaledViewport = page.getViewport({ scale: 1 })
                    const containerWidth = container.clientWidth || (window.innerWidth - 48)
                    const scale = containerWidth / unscaledViewport.width
                    const viewport = page.getViewport({ scale: scale })

                    const canvas = document.createElement('canvas')
                    const context = canvas.getContext('2d')
                    canvas.height = viewport.height
                    canvas.width = viewport.width
                    canvas.style.display = 'block'
                    canvas.style.marginBottom = '12px'
                    canvas.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'

                    container.appendChild(canvas)

                    await page.render({
                        canvasContext: context,
                        viewport
                    }).promise
                }
            } catch (err) {
                console.error('Gagal memuat PDF:', err)
            } finally {
                this.renderingPdf = false
            }
        },
        downloadFile(file) {
            const url = `https://server.jdih.konaweselatankab.go.id/uploads/peraturan/${file}`;
            window.open(url, '_blank');
        }
    },
    mounted() {
        this.initData()
    }
}
</script>

<style></style>
