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
                        <q-input outlined placeholder="Nama Pendidikan" class="formInput" />
                    </div>
                    <div class="col-6 col-md-6 frame">
                        <q-input outlined placeholder="Pendidikan" class="formInput" />
                    </div>
                    <div class="col-6 col-md-6 frame">
                        <q-input outlined placeholder="Jurusan" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input outlined placeholder="Tahun Tamat" type="number" class="formInput" />
                    </div>
                    <div class="col-12 col-md-12">
                        <q-input outlined placeholder="Nilai" class="formInput" />
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
    name: 'TambahPendidikan',
    data() {
        return {
            prov: 'Sulawesi Tenggara',
            kab: 'Konawe Selatan',
            nik: '7405182106060001',
            nama: 'Muh. Risal Al-Ihram',
            tmpLahir: 'Konawe Selatan',
            tanggalLahir: '21 Mei 2001',
            jenisKelamin: 'Laki-Laki',
            alamat: 'Dusun III Desa Ranooha, Kecamatan Ranomeeto',
            dusun: 'III',
            rt_rw: '003/001',
            kec: 'Ranomeeto',
            kel: 'Ranooha',
            no: '082236027854',
            email: 'muhrisalihram@gmail.com',
            perkawinan: 'Kawin',
            agama: 'Islam',
            tinggi_bdn: '175',
            berat_bdn: '70',
            file: null
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
