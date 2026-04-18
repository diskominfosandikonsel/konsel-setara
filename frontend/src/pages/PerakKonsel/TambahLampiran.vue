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
                        <q-input v-model="form.uraian" outlined placeholder="Uraian" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-file v-model="form.file" outlined class="formInput">
                            <template v-slot:prepend>
                                <q-icon name="attach_file" />
                            </template>
                        </q-file>
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
                uraian : '',
                file : null,
                file_type : ''
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
                await this.perak.addLampiran(this.form);
                this.$router.push('/lampiran');
            } catch (error) {
                console.error("Error:", error);
            } finally {
                this.loading = false;
            }
        },
    }
}
</script>
