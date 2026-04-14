<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Edit Data</span>
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
    name: 'EditPendidikan',
    data() {
        return {
            form : {
                id : '',
                biodata_id : '',
                nama_pendidikan : '',
                pendidikan_id : '',
                jurusan_id : '',
                tahun_tamat : '',
                nem_ipk : '',
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
        async editData() {
            const success = await this.perak.editPendidikan(this.form)
            if (success) {
                this.$router.push('/pendidikanFormal');
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
        },
    },
    mounted(){
        this.initData()

        // console.log("SA PANGGIL KO");
        if (this.perak.dataEdit) {
            const data = this.perak.dataEdit;
            // console.log(data);
            this.form.id = data.id;
            this.form.biodata_id = data.biodata_id;
            this.form.nama_pendidikan = data.nama_pendidikan;
            this.form.pendidikan_id = data.pendidikan_id;
            this.form.jurusan_id = data.jurusan_id;
            this.form.tahun_tamat = data.tahun_tamat;
            this.form.nem_ipk = data.nem_ipk;
        }
    }
}
</script>
