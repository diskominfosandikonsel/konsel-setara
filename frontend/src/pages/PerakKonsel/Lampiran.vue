<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Lampiran</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>
        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <div v-if="loading" class="flex flex-center q-pa-xl">
                    <q-spinner-dots color="primary" size="40px" />
                </div>
                <q-list class="mulish q-pa-md">
                    <template v-if="perak.lampiran && perak.lampiran.length > 0">
                        <q-card v-for="(data, index) in perak.lampiran" :key="index" class="q-mb-md cardPengalaman q-pa-md">
                            <div class="row items-center no-wrap">
                                <div class="col-auto q-mr-md">
                                    <q-avatar 
                                        v-if="data.file_type === 'application/pdf'" 
                                        size="40px" 
                                        color="red-1" 
                                        text-color="negative" 
                                        icon="r_picture_as_pdf" 
                                    />

                                    <q-avatar 
                                        v-else-if="data.file_type == 'image/png' || data.file_type == 'image/jpeg' || data.file_type == 'image/jpg' "
                                        size="40px" 
                                        color="blue-1" 
                                        text-color="primary" 
                                        icon="r_image" 
                                    />

                                </div>
                                <div class="col">
                                    <div class="text-weight-bold text-grey-9 ellipsis" style="font-size: 13px;">
                                        {{ data.uraian }}
                                    </div>
                                    <div class="text-caption text-grey-6">
                                        {{ data.file }}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <q-btn flat round color="grey-7" icon="r_settings" size="13px">
                                        <q-menu auto-close transition-show="scale" transition-hide="scale" class="menu-setting">
                                            <q-list style="min-width: 100px">
                                                <q-item clickable @click="previewFile(data)">
                                                    <q-item-section avatar>
                                                        <q-icon name="r_visibility" color="primary" size="20px" />
                                                    </q-item-section>
                                                    <q-item-section>Lihat</q-item-section>
                                                </q-item>
                                                <q-separator />
                                                <q-item clickable @click="confirmDelete(data)">
                                                    <q-item-section avatar>
                                                        <q-icon name="r_delete" color="negative" size="20px" />
                                                    </q-item-section>
                                                    <q-item-section class="text-negative">Hapus</q-item-section>
                                                </q-item>
                                            </q-list>
                                        </q-menu>
                                    </q-btn>
                                </div>
                            </div>
                        </q-card>
                    </template>

                    <template v-else>
                        <div class="column justify-center items-center q-pa-xl" style="min-height: 70vh;">
                            <q-img
                                src="/img/no_data.png"
                                fit="contain"
                                style="width: 120px; height: 120px;"
                                no-spinner
                            />
                            <div class="text-subtitle1 text-grey-6 q-mt-md text-weight-medium">
                                Tidak ada data ditemukan
                            </div>
                            <div class="divBtn flex flex-center" @click="goAdd">
                                <q-icon name="r_add" color="white" size="40px" />
                            </div>
                        </div>
                    </template>
                </q-list>
                <div class="divBtn flex flex-center" @click="goAdd">
                    <q-icon name="r_add" color="white" size="40px" />
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { usePerakStore } from 'stores/perak'

export default {
    name: 'Lampiran',
    data() {
        return {
            showPreview: false,
            selectedFile: null,

            loading: false,
            page_first: 1,
            cari_value: '',
            page_limit: 10,
        }
    },
    computed: {
        perak() {
            return usePerakStore()
        },
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        goAdd() {
            if (this.perak.biodata.length > 0) {
                const id = this.perak.biodata[0].id
                this.$router.push({
                    path: '/tambahLampiran',
                    query: { b_id: id }
                });
            }
        },
        async loadData() {
            const payloadBio = {
                data_ke: this.page_first,
                cari_value: this.cari_value,
            }
            await this.perak.fetchBiodata(payloadBio);

            const payloadLampiran = {
                biodata_id: this.perak.biodata[0].id,
                data_ke: this.page_first,
                cari_value: this.cari_value,
                limit: this.page_limit
            }
            await this.perak.fetchLampiran(payloadLampiran);
        },

        confirmDelete(data) {
            this.$q.dialog({
                title: 'Konfirmasi Hapus',
                message: 'Apakah Anda yakin ingin menghapus data?',
                cancel: {
                    color: 'grey',
                    label: 'Batal',
                    flat: true
                },
                ok: {
                    color: 'negative',
                    label: 'Hapus',
                    unelevated: true
                },
                persistent: true
            }).onOk(async () => {
                await this.perak.removeLampiran(data.id, data.file);
                this.loadData();
            })
        },

        previewFile(data) {
            const baseUrl = 'https://serverperak.konaweselatankab.go.id/uploads/';
            const fullUrl = baseUrl + data.file;
            
            window.open(fullUrl, '_blank');
        }
    },
    mounted() {
        this.loadData()
    }
}
</script>
