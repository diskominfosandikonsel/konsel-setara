<template>
    <q-layout view="hHh lpR fFf">

        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Bahasa Asing</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <div v-if="loading" class="flex flex-center q-pa-xl">
                    <q-spinner-dots color="primary" size="40px" />
                </div>
                <q-list class="mulish q-pa-md">
                    <template v-if="perak.bahasa && perak.bahasa.length > 0">
                        <q-card v-for="(data) in perak.bahasa" :key="data.id" class="q-mb-md cardPendidikan shadow-2">
                            <q-card-section class="q-pa-md">
                                <div class="row no-wrap items-start justify-between">
                                    <div class="col">
                                        <div class="text-weight-bold textPrimary" style="font-size: 16px;">{{ data.uraian_bahasa }}</div>

                                        <div class="text-caption text-weight-bold q-mb-sm text-grey-7">
                                            {{ data.tahun }}
                                        </div>
                                    </div>

                                    <div class="col-auto">
                                        <q-btn flat round color="grey-7" icon="r_settings" size="12px">
                                            <q-menu auto-close transition-show="scale" transition-hide="scale">
                                                <q-list style="min-width: 120px">
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
                            </q-card-section>
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
        goAdd() {
            if (this.perak.biodata.length > 0) {
                const id = this.perak.biodata[0].id
                this.$router.push({
                    path: '/tambahBahasa',
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

            const payloadBahasa = {
                biodata_id: this.perak.biodata[0].id,
                data_ke: this.page_first,
                cari_value: this.cari_value,
                limit: this.page_limit
            }
            await this.perak.fetchBahasa(payloadBahasa);
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
                await this.perak.removeBahasa(data.id);
                this.loadData();
            })
        },
    },
    mounted() {
        this.loadData()
    }
}
</script>
