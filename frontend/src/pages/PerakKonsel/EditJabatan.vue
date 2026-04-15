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
    name: 'EditJabatan',
    data() {
        return {
            form: {
                id : '',
                biodata_id : '',
                ditujukan : '',
                jabatan : '',
                lokasi : '',
                lokasi_wilayah: '',
                besaran_upah_id : '',
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
            const success = await this.perak.editJabatan(this.form)
            if (success) {
                this.$router.push('/jabatan');
            }
        },
        async initData() {
            await this.perak.fetchUpah()
        }
    },
    mounted(){
        this.initData()

        if (this.perak.dataEdit) {
            const data = this.perak.dataEdit;
            // console.log(data);
            this.form.id = data.id;
            this.form.biodata_id = data.biodata_id;
            this.form.ditujukan = data.ditujukan;
            this.form.jabatan = data.jabatan;
            this.form.lokasi = data.lokasi;
            this.form.lokasi_wilayah = data.lokasi_wilayah;
            this.form.besaran_upah_id = data.besaran_upah_id;
        }
    }
}
</script>
