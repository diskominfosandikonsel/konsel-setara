<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer"
                            @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Edit Data</span>
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
                        <q-btn label="Edit" class="btnEdit bg-warning full-width" unelevated no-caps @click="editData" />
                    </div>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { usePerakStore } from 'stores/perak'

export default {
    name: 'EditPengalaman',
    data() {
        return {
            form: {
                id : '',
                biodata_id : '',
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
        async editData() {
            const success = await this.perak.editPengalaman(this.form)
            if (success) {
                this.$router.push('/pengalamanKerja');
            }
        },
        async initData() {
            await this.perak.fetchPendidikan()
        },
    },
    mounted(){
        this.initData()

        console.log("EDIT PENGALAMAN KERJA");
        if (this.perak.dataEdit) {
            const data = this.perak.dataEdit;
            // console.log(data);
            this.form.id = data.id;
            this.form.biodata_id = data.biodata_id;
            this.form.jabatan = data.jabatan;
            this.form.uraian_tugas = data.uraian_tugas;
            this.form.lama_kerja = data.lama_kerja;
            this.form.pemberian_pengguna = data.pemberian_pengguna;
            this.form.catatan = data.catatan;
        }
    }
}
</script>
