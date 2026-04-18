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
                        <q-select
                            v-model="form.bahasa_id"
                            :options="perak.list_bahasa"
                            option-value="id"
                            option-label="uraian"
                            label="Status Perkawinan"
                            class="formInput"
                            outlined emit-value map-options
                        />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input v-model="form.tahun" outlined placeholder="Tahun" type="number" class="formInput" />
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
    name: 'TambahLampiran',
    data() {
        return {
            form : {
                id : '',
                biodata_id : this.$route.query.b_id,
                bahasa_id : '',
                tahun : '',
            },
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
        async addData() {
            this.loading = true;
            try {
                await this.perak.addBahasa(this.form);
                this.$router.push('/bahasa');
            } catch (error) {
                console.error("Error:", error);
            } finally {
                this.loading = false;
            }
        },
        async initData() {
             await this.perak.fetchListBahasa()
        }
    },
    mounted() {
        this.initData()
    }
}
</script>
