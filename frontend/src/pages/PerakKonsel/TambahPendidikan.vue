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
                        <q-input v-model="form.nama_pendidikan" outlined placeholder="Nama Pendidikan" class="formInput" />
                    </div>
                    <div class="col-6 col-md-6 frame">
                        <q-select
                            v-model="form.pendidikan_id"
                            :options="perak.list_pendidikan"
                            option-value="id"
                            option-label="uraian"
                            label="Pendidikan"
                            class="formInput"
                            outlined emit-value map-options
                            @update:model-value="onPendidikanChange"
                        />
                    </div>
                    <div class="col-6 col-md-6 frame">
                        <q-select
                            v-model="form.jurusan_id"
                            :options="perak.list_jurusan"
                            option-value="id"
                            option-label="uraian"
                            label="Jurusan"
                            class="formInput"
                            outlined emit-value map-options
                            :loading="perak.loading"
                            :disable="!form.pendidikan_id"
                        />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.tahun_tamat" outlined placeholder="Tahun Tamat" type="number" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.nem_ipk" outlined placeholder="Nilai" class="formInput" />
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
    name: 'TambahPendidikan',
    data() {
        return {
            form : {
                id : '',
                biodata_id : this.$route.query.b_id,
                pendidikan_id : '',
                tahun_tamat : '',
                nem_ipk : '',
                jurusan_id : '',
                pendidikan_formal : '',
                tipe_nilai : '',
            },
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
                await this.perak.addPendidikan(this.form);
                this.$q.notify({
                    message: 'Data Berhasil Disimpan!',
                    color: 'positive',
                    icon: 'check_circle',
                    position: 'top'
                });
                this.$router.push('/pendidikanFormal');
            } catch (error) {
                console.error("Error:", error);
            } finally {
                this.loading = false;
            }
        },

        async onPendidikanChange(val) {
            this.form.jurusan_id = null
            if (val) {
                await this.perak.fetchJurusan(val)
            }
        },
        async initData() {
            await this.perak.fetchPendidikan()
        }
    },
    mounted() {
        this.initData()
    }
}
</script>
