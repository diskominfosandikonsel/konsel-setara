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
                        <q-input v-model="form.prov" outlined placeholder="Provinsi" class="formInput" disable />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.kab" outlined placeholder="Kabupaten" class="formInput" disable />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.nama" outlined placeholder="Nama Lengkap" class="formInput" disable />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.nik" outlined placeholder="NIK" class="formInput" type="number" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.tmp_lahir" outlined placeholder="Tempat Lahir" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.tgl_lahir" outlined placeholder="Tanggal Lahir" class="formInput" type="date" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-select v-model="form.jns_kelamin" :options="perak.opsiJenkel" emit-value map-options outlined label="Jenis Kelamin" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.alamat" outlined placeholder="Alamat" class="formInput" type="textarea" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.dusun" outlined placeholder="Dusun" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.rt_rw" outlined placeholder="RT/RW" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-select
                            v-model="form.kecamatan_id"
                            :options="perak.list_kecamatan"
                            option-value="kecamatan_id"
                            option-label="nama_kecamatan"
                            label="Kecamatan"
                            class="formInput"
                            outlined emit-value map-options
                            @update:model-value="onKecamatanChange"
                        />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-select
                            v-model="form.des_kel_id"
                            :options="perak.list_des_kel"
                            option-value="des_kel_id"
                            option-label="nama_des_kel"
                            label="Desa/Kelurahan"
                            class="formInput"
                            outlined emit-value map-options
                            :loading="perak.loading_wilayah"
                            :disable="!form.kecamatan_id"
                        />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.hp" placeholder="Telp/Hp" outlined class="formInput" disable />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.email" placeholder="Email" outlined class="formInput" disable />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.kode_pos" placeholder="Kode Pos" outlined class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-select
                            v-model="form.status_perkawinan_id"
                            :options="perak.list_perkawinan"
                            option-value="id"
                            option-label="uraian"
                            label="Status Perkawinan"
                            class="formInput"
                            outlined emit-value map-options
                        />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-select
                            v-model="form.agama_id"
                            :options="perak.list_agama"
                            option-value="id"
                            option-label="uraian"
                            label="Agama"
                            class="formInput"
                            outlined emit-value map-options
                        />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.tinggi_bdn" placeholder="Tinggi Badan" outlined class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.berat_bdn" placeholder="Berat Badan" outlined class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-file v-model="form.file" outlined class="formInput">
                            <template v-slot:prepend>
                                <q-icon name="attach_file" />
                            </template>
                        </q-file>
                    </div>
                    <div class="col-12 col-md-12">
                        <q-btn label="Simpan" class="btnSimpan full-width" unelevated no-caps @click="editData" />
                    </div>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { usePerakStore } from 'stores/perak'

export default {
    name: 'EditBiodata',
    data() {
        return {
            form:{
                prov: 'Sulawesi Tenggara',
                kab: 'Konawe Selatan',

                nama: '',
                hp: '',
                email: '',

                id: '',
                nik: '',
                tmp_lahir: '',
                tgl_lahir: '',
                jns_kelamin: '',
                alamat: '',
                dusun: '',
                rt_rw: '',
                kecamatan_id: null,
                des_kel_id: null,
                kode_pos: '',
                status_perkawinan_id: null,
                agama_id: null,
                tinggi_bdn: '',
                berat_bdn: '',
                file: null,
            },
            file_old: '',
        }
    },
    computed: {
        perak() {
            return usePerakStore()
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        async editData() {
            const success = await this.perak.editBiodata(this.form, this.file_old)
            if (success) {
                this.$router.push('/biodata')
            }
        },

        async onKecamatanChange(val) {
            this.form.des_kel_id = null // Reset desa jika kecamatan ganti
            if (val) {
                await this.perak.fetchDesKel(val)
            }
        },
        async initData() {
            await this.perak.fetchKecamatan()
            await this.perak.fetchPerkawinan()
            await this.perak.fetchAgama()
        }
    },
    async mounted() {
        this.initData()

        if (localStorage.user) {
            try {
                const get_profile = JSON.parse(localStorage.user);
                this.form.nama = get_profile.profile.nama || '';
                this.form.hp = get_profile.profile.hp || '';
                this.form.email = get_profile.profile.email || '';
            } catch (e) {
                console.error("Gagal parse profile dari localStorage", e);
            }
        }

        console.log("SA PANGGIL KO");
        if (this.perak.dataEdit) {
            const data = this.perak.dataEdit;
            console.log(data);
            this.form.id = data.id;
            this.form.nik = data.nik;
            this.form.tmp_lahir = data.tmp_lahir;
            this.form.tgl_lahir = data.tgl_lahir;
            this.form.jns_kelamin = data.jns_kelamin;
            this.form.alamat = data.alamat;
            this.form.dusun = data.dusun;
            this.form.rt_rw = data.rt_rw;
            this.form.kecamatan_id = data.kecamatan_id;
            this.form.des_kel_id = data.des_kel_id;
            this.form.kode_pos = data.kode_pos;
            this.form.status_perkawinan_id = data.status_perkawinan_id;
            this.form.agama_id = data.agama_id;
            this.form.tinggi_bdn = data.tinggi_bdn;
            this.form.berat_bdn = data.berat_bdn;

            this.file_old = data.file;

            if (this.form.kecamatan_id) {
                await this.perak.fetchDesKel(this.form.kecamatan_id);
            }
        }
    }
}
</script>
