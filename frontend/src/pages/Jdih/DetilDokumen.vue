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
                <!-- <q-card v-if="jdih.dokumen" flat class="bg-white rounded-borders shadow-1 mulish"> -->
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
                    <q-card flat bordered class="pdf-container shadow-2 overflow-hidden" style="border-radius: 12px;">
                        <!-- :src="`https://docs.google.com/viewer?url=${encodeURIComponent(getPdfUrl(jdih.dokumen.file))}&embedded=true`"  -->
                        <iframe 
                            :src="getPdfUrl(jdih.dokumen.file)"
                            width="100%" 
                            height="600px" 
                            frameborder="0"
                        >
                        </iframe>
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
            loading: false
        }
    },
    computed: {
        jdih() { return useJdihStore() }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        getPdfUrl(file) {
            if (!file) return '';
            return `https://server.jdih.konaweselatankab.go.id/uploads/peraturan/${file}`;
        },

        downloadFile(file) {
            const url = this.getPdfUrl(file);
            window.open(url, '_blank');
        }
    }
}
</script>

<style></style>
