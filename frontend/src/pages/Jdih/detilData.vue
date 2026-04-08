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
                    <q-card flat bordered class="pdf-container shadow-2">
                        <iframe :src="getPdfUrl(jdih.detailProduk.file)" width="100%" height="600px" frameborder="0">
                            This browser does not support PDFs.
                            <a :href="getPdfUrl(jdih.detailProduk.file)">Download PDF</a>
                        </iframe>
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
        async initData() {
            const id = this.$route.query.id
            if (id) {
                this.loading = true
                await this.jdih.fetchDetailProduk(id)
                this.loading = false
            }
        },
        getPdfUrl(file) {
            if (!file) return '';
            return `https://server.jdih.konaweselatankab.go.id/uploads/peraturan/${file}`;
        },

        downloadFile(file) {
            const url = this.getPdfUrl(file);
            window.open(url, '_blank');
        }
    },
    mounted() {
        this.initData()
    }
}
</script>

<style></style>
