<template>
    <q-layout view="hHh lpR fFf">

        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Pendidikan Formal</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <div v-if="loading" class="flex flex-center q-pa-xl">
                    <q-spinner-dots color="primary" size="40px" />
                </div>
                <q-list class="mulish q-pa-md">
                    <template v-if="perak.pendidikan">
                        <q-card v-for="(data) in perak.pendidikan" :key="data.id" class="q-mb-md cardPendidikan shadow-2">
                            <q-card-section class="q-pa-md">
                                <div class="row no-wrap items-start justify-between">
                                    <div class="col">
                                        <div class="text-weight-bold textPrimary" style="font-size: 16px;">{{ data.nama_pendidikan }}</div>

                                        <div class="text-caption text-weight-bold q-mb-sm text-grey-7">
                                            {{ data.pendidikan_uraian }}
                                        </div>
                                        
                                        <div class="text-caption text-weight-medium text-grey-6 q-mt-xs">
                                            <q-icon name="r_history_edu" size="14px" /> {{ data.jurusan_uraian }}
                                        </div>
                                    </div>

                                    <div class="col-auto">
                                        <q-btn flat round color="grey-7" icon="r_settings" size="12px">
                                            <q-menu auto-close transition-show="scale" transition-hide="scale">
                                                <q-list style="min-width: 120px">
                                                    <q-item clickable @click="goEdit(data)">
                                                        <q-item-section avatar>
                                                            <q-icon name="r_edit" color="warning" size="20px" />
                                                        </q-item-section>
                                                        <q-item-section class="text-weight-medium">Edit</q-item-section>
                                                    </q-item>
                                                    <q-separator />
                                                    <q-item clickable @click="confirmDelete(data)">
                                                        <q-item-section avatar>
                                                            <q-icon name="r_delete" color="negative" size="20px" />
                                                        </q-item-section>
                                                        <q-item-section class="text-weight-medium">Hapus</q-item-section>
                                                    </q-item>
                                                </q-list>
                                            </q-menu>
                                        </q-btn>
                                    </div>
                                </div>

                                <q-separator class="q-my-md" style="opacity: 0.5;" />

                                <div class="row text-center q-col-gutter-sm">
                                    <div class="col-6" style="border-right: 1px solid #eeeeee;">
                                        <div class="text-caption text-grey-6">Tahun Tamat</div>
                                        <div class="text-weight-bold text-grey-9">{{ data.tahun_tamat }}</div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-caption text-grey-6">NEM / IPK</div>
                                        <div class="text-weight-bold text-primary">{{ data.nem_ipk || '0.00' }}</div>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>
                    </template>

                    <template v-else>
                        <div class="column flex-center q-pa-xl" style="min-height: 400px;">
                            <q-img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" style="width: 120px; opacity: 0.5;" />
                            <div class="text-h6 text-grey-5 q-mt-md">Data Belum Ada</div>
                            <div class="text-caption text-grey-4">Klik tombol + untuk menambah riwayat pendidikan</div>
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
    name: 'PendidikanFormal',
    data() {
        return {
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
        goDetile(){
            this.$router.push('/detilePendidikan');
        },
        goAdd() {
            if (this.perak.biodata.length > 0) {
                const id = this.perak.biodata[0].id
                this.$router.push({
                    path: '/tambahPendidikan',
                    query: { b_id: id }
                });
            }
        },
        goEdit(item) {
            this.perak.selectData(item) 
            this.$router.push('/editPendidikan');
        },

        async loadData() {
            const payloadBio = {
                data_ke: this.page_first,
                cari_value: this.cari_value,
            }
            await this.perak.fetchBiodata(payloadBio);

            const payloadPendidikan = {
                biodata_id: this.perak.biodata[0].id,
                data_ke: this.page_first,
                cari_value: this.cari_value,
                limit: this.page_limit
            }
            await this.perak.fetchPendidikanFormal(payloadPendidikan);
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
                await this.perak.removePendidikan(data.id);
                // Setelah penghapusan, refresh data
                this.loadData();
            })
        },
    },
    mounted() {
        this.loadData()
    }
}
</script>
