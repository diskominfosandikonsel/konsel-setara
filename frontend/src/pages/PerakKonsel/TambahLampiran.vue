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
                        <q-input outlined placeholder="Uraian" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-file v-model="file" outlined class="formInput">
                            <template v-slot:prepend>
                                <q-icon name="attach_file" />
                            </template>
                        </q-file>
                    </div>
                    <div class="col-12 col-md-12">
                        <q-btn label="Tambah" class="btnSimpan full-width" unelevated no-caps @click="saveData" />
                    </div>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>

export default {
    name: 'TambahLampiran',
    data() {
        return {
            lokasi_pilihan: null,
            upah: null,

            optionsLokasi: [
                { label: 'Dalam Negeri', value: 1 },
                { label: 'Luar Negeri', value: 2 }
            ],
            optionsUpah: [
                { label: '< Rp. 1.000.000', value: 1 },
                { label: 'Rp. 1.000.000 - Rp. 2.500.000', value: 2 },
                { label: 'Rp. 2.500.000 - Rp. 5.000.000', value: 3 },
                { label: '> Rp. 5.000.000', value: 4 }
            ]
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        saveData() {
            this.$q.notify({
                message: 'Data Berhasil Ditambahkan!',
                color: 'positive',
                icon: 'check_circle',
                position: 'top', // Bisa 'top', 'bottom', 'center'
                timeout: 2000,   // Hilang dalam 2 detik
                actions: [{ label: 'Tutup', color: 'white', handler: () => { /* ... */ } }]
            })
        }
    }
}
</script>
