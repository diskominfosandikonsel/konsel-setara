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
                        <q-input v-model="form.jabatan" outlined placeholder="Jabatan" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.uraian_tugas" outlined placeholder="Uraian Tugas" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.lama_kerja" outlined placeholder="Lama Kerja" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.pemberian_pengguna" outlined placeholder="Pemberian/Pengguna" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.catatan" outlined placeholder="Catatan Pengantar Kerja" class="formInput" />
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
    name: 'TambahPengalaman',
    data() {
        return {
            form: {
                id : '',
                biodata_id : this.$route.query.b_id,
                jabatan : '',
                uraian_tugas : '',
                lama_kerja : '',
                pemberian_pengguna : '',
                catatan : '',
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
                await this.perak.addPengalaman(this.form);
                this.$router.push('/pengalamanKerja');
            } catch (error) {
                console.error("Error:", error);
            } finally {
                this.loading = false;
            }
        },
    }
}
</script>
