<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Tambah Data</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md">
                <div class="row" style="margin-top: 30px">
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.ditujukan" outlined placeholder="Ditujukan Ke Perusahaan/Kementrian/Lainnya" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.jabatan" outlined placeholder="Jabatan Yang Dinginkan" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-select
                            v-model="form.lokasi"
                            :options="perak.opsiLokasi"
                            emit-value map-options outlined
                            label="Lokasi"
                            class="formInput"
                        />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.lokasi_wilayah" outlined placeholder="Lokasi Tempat Tinggal/Wilayah Lain" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-select
                            v-model="form.besaran_upah_id"
                            :options="perak.list_upah"
                            option-value="id"
                            option-label="uraian"
                            class="formInput"
                            label="Besaran Upah yang Diinginkan"
                            outlined emit-value map-options
                        />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-btn label="Tambah" class="btnSimpan full-width" unelevated no-caps @click="addData" />
                    </div>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { usePerakStore } from 'stores/perak'

export default {
    name: 'TambahJabatan',
    data() {
        return {
            form: {
                id : '',
                biodata_id : this.$route.query.b_id,
                ditujukan : '',
                jabatan : '',
                lokasi : '',
                lokasi_wilayah : '',
                besaran_upah_id : '',
            },
            lokasi_pilihan: null,
            upah: null,
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
        async addData() {
            if (!this.form.biodata_id) {
                this.$q.notify({
                    message: 'ID Biodata tidak ditemukan, silahkan muat ulang halaman',
                    color: 'negative'
                });
                return;
            }
            this.loading = true;
            console.log("Data yang akan dikirim:", this.form);
            try {
                await this.perak.addJabatan(this.form);
                this.$router.push('/jabatan');
            } catch (error) {
                console.error("Error:", error);
            } finally {
                this.loading = false;
            }
        },
        async initData() {
            await this.perak.fetchUpah()
        }
    },
    mounted() {
        this.initData()
    }
}
</script>
