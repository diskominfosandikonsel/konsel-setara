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
                <q-card v-if="jdih.dokumen && jdih.dokumen.judul" flat class="bg-white rounded-borders shadow-1 mulish">
                    <q-list separator>
                        <q-item class="q-py-md">
                            <q-item-section class="col-4">
                                <q-item-label class="text-weight-bold text-caption text-grey-9">Judul Dokumen</q-item-label>
                            </q-item-section>
                            <q-item-section class="col-8">
                                <q-item-label class="text-caption text-grey-10">
                                    {{ jdih.dokumen.judul }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item class="q-py-md">
                            <q-item-section class="col-4">
                                <q-item-label class="text-weight-bold text-caption text-grey-9">Jenis</q-item-label>
                            </q-item-section>
                            <q-item-section class="col-8">
                                <q-item-label class="text-caption text-grey-10">
                                    {{ jdih.dokumen.jenis }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card>

                <div v-if="jdih.dokumen && jdih.dokumen.file" class="q-mt-lg">
                    <div class="text-subtitle2 q-mb-sm text-grey-8 mulish">Pratinjau Dokumen:</div>
                    <q-card flat bordered class="pdf-viewer-wrapper shadow-2">
                        <div v-if="renderingPdf" class="flex flex-center q-pa-lg">
                            <q-spinner-ios color="primary" size="30px" />
                            <div class="q-ml-md text-caption">Memuat halaman...</div>
                        </div>

                        <div ref="pdfContainer" class="pdf-render-container"></div>
                    </q-card>
                    <q-btn 
                        color="primary" 
                        class="full-width q-mt-md mulish" 
                        icon="download" 
                        label="Unduh Dokumen" 
                        @click="downloadFile(jdih.dokumen.file)" 
                    />
                </div>

                <div v-else class="justify-center items-center q-pa-md empty-container">
                    <q-img
                        src="/img/no_data.png"
                        fit="contain"
                        style="width: 120px; height: 120px;"
                        no-spinner
                    />
                    <div class="text-subtitle1 text-grey-6 q-mt-md text-weight-medium">
                            Tidak ada data ditemukan
                        </div>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { useJdihStore } from 'stores/jdih'

export default {
    data() {
        return {
            loading: false,
            renderingPdf: false
        }
    },
    computed: {
        jdih() { return useJdihStore() }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        async initData() {
            const id = this.$route.query.id
            if (!id) return

            this.loading = true
            
            // 1. Cek dulu apakah data sudah ada di store
            let dataDitemukan = this.jdih.dokumen.find(item => item.id == id)
            
            // 2. Jika tidak ada (kasus refresh halaman), fetch ulang list-nya
            if (!dataDitemukan) {
                await this.jdih.fetchDokumen()
                dataDitemukan = this.jdih.dokumen.find(item => item.id == id)
            }

            if (dataDitemukan) {
                this.jdih.detailProduk = dataDitemukan
                this.$nextTick(() => {
                    if (this.jdih.detailProduk.file) {
                        this.renderPdf(this.jdih.detailProduk.file)
                    }
                })
            }
            
            this.loading = false
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
