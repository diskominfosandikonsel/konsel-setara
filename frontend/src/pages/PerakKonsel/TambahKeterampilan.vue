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
                            v-model="form.keterampilan_id"
                            use-input hide-selected fill-input
                            input-debounce="300"
                            :options="perak.list_keterampilan"
                            option-value="id"
                            option-label="uraian"
                            label="Keterampilan"
                            class="formInput"
                            outlined emit-value map-options
                            @filter="autocomplete_keterampilan"
                            clearable
                        >
                            <template v-slot:no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                        Tidak ditemukan
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
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
                keterampilan_id : '',
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
                await this.perak.addKeterampilan(this.form);
                
                this.$q.notify({
                    message: 'Data Berhasil Disimpan!',
                    color: 'positive',
                    icon: 'check_circle',
                    position: 'top'
                });

                this.$router.push('/keterampilan');
            } catch (error) {
                console.error("Error:", error);
            } finally {
                this.loading = false;
            }
        },
        autocomplete_keterampilan(val, update, abort) {
            update( () => {
                if (val == '') {}
                else {
                this.perak.fetchListKeterampilan(val)
                }
            })
        },
        async initData() {
            await this.perak.fetchListKeterampilan()
        }
    },
    mounted() {
        this.initData()
    }
}
</script>
