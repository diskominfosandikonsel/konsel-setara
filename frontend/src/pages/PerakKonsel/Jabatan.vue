<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Jabatan</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>
        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <q-list class="mulish q-pa-md">
                    <q-card v-for="(item, index) in listMinatJabatan" :key="index" class="q-mb-md cardPendidikan q-pa-md">
                        <div class="row no-wrap items-start justify-between">
                            <div class="col">
                                <div class="text-weight-bold textPrimary">{{ item.jabatan_diinginkan }}</div>
                                <div class="judul">{{ item.tujuan_instansi }}</div>
                            </div>
                            <div class="col-auto">
                                <q-btn flat round color="grey-7" icon="r_settings" size="14px">
                                    <q-menu auto-close transition-show="scale" transition-hide="scale" class="menu-setting">
                                        <q-list style="min-width: 120px">
                                            <q-item clickable @click="goEdit">
                                                <q-item-section avatar>
                                                    <q-icon name="r_edit" color="warning" size="20px" />
                                                </q-item-section>
                                                <q-item-section class="text-weight-medium">Edit</q-item-section>
                                            </q-item>

                                            <q-separator />

                                            <q-item clickable>
                                                <q-item-section avatar>
                                                    <q-icon name="r_delete" color="negative" size="20px" />
                                                </q-item-section>
                                                <q-item-section class="text-weight-medium">Hapus</q-item-section>
                                            </q-item>

                                        </q-list>
                                    </q-menu>
                                </q-btn>
                            </div>
                        </div>
                        <q-separator class="q-mb-sm q-mt-sm" />
                        <div class="row q-col-gutter-xs">
                            <div class="col-5 judul">Penempatan:</div>
                            <div class="col-7 subJudul">{{ item.lokasi_pilihan }} ({{ item.wilayah_tinggal }})</div>
                            
                            <div class="col-5 judul">Ekspektasi Gaji:</div>
                            <div class="col-7 subJudul">{{ item.besaran_upah }}</div>
                        </div>
                    </q-card>
                    </q-list>
                <div class="divBtn flex flex-center" @click="goAdd">
                    <q-icon name="r_add" color="white" size="40px" />
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>

export default {
    name: 'Jabatan',
    data() {
        return {
            listMinatJabatan: [
                {
                    tujuan_instansi: 'Kementerian Komunikasi dan Digital',
                    jabatan_diinginkan: 'Pranata Komputer / Software Engineer',
                    lokasi_pilihan: 'Dalam Negeri',
                    wilayah_tinggal: 'Jakarta Pusat',
                    besaran_upah: 'Rp. 2.500.000 - Rp. 5.000.000'
                },
                {
                    tujuan_instansi: 'PT. Teknologi Maju Jaya',
                    jabatan_diinginkan: 'Full Stack Developer',
                    lokasi_pilihan: 'Dalam Negeri',
                    wilayah_tinggal: 'Kendari, Sulawesi Tenggara',
                    besaran_upah: '> Rp. 5.000.000'
                },
                {
                    tujuan_instansi: 'Google Asia Pacific',
                    jabatan_diinginkan: 'Site Reliability Engineer',
                    lokasi_pilihan: 'Luar Negeri',
                    wilayah_tinggal: 'Singapore / Remote',
                    besaran_upah: '> Rp. 5.000.000'
                },
                {
                    tujuan_instansi: 'Pemerintah Daerah Konawe Selatan',
                    jabatan_diinginkan: 'Tenaga Ahli IT',
                    lokasi_pilihan: 'Dalam Negeri',
                    wilayah_tinggal: 'Andoolo',
                    besaran_upah: 'Rp. 1.000.000 - Rp. 2.500.000'
                }
            ],
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        goAdd() {
            this.$router.push('/tambahJabatan');
        },
        goEdit() {
            this.$router.push('/editJabatan');
        }
    }
}
</script>
