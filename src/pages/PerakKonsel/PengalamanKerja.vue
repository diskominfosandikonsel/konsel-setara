<template>
    <q-layout view="hHh lpR fFf">

        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Pengalaman Kerja</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <q-list class="mulish q-pa-md">
                    <q-card v-for="(kerja, index) in listPengalamanKerja" :key="index" class="q-mb-md cardPengalaman q-pa-md">
                        <div class="row no-wrap items-start justify-between">
                            <div class="col">
                                <div class="text-weight-bold textPrimary">{{ kerja.jabatan }}</div>
                                <div class="text-caption text-weight-bold q-mb-sm text-grey-7">{{ kerja.pemberi_kerja }}</div>
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
                        <q-separator q-mb-sm />
                        <div class="row q-col-gutter-xs q-mt-xs">
                            <div class="col-4 text-caption text-grey-8">Masa Kerja:</div>
                            <div class="col-8 text-caption">{{ kerja.lama_kerja }}</div>
                            <div class="col-4 text-caption text-grey-8">Uraian:</div>
                            <div class="col-8 text-caption">{{ kerja.uraian }}</div>
                            <div class="col-4 text-caption text-grey-8">Catatan:</div>
                            <div class="col-8 text-caption">{{ kerja.catatan_pengantar }}</div>
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
    name: 'PengalamanKerja',
    data() {
        return {
            listPengalamanKerja: [
                {
                    jabatan: 'Senior Full Stack Developer',
                    uraian: 'Bertanggung jawab dalam pengembangan dan pemeliharaan aplikasi pelaporan publik (Lapor Bupati) serta integrasi sistem API antar dinas.',
                    lama_kerja: '2 Tahun 4 Bulan',
                    pemberi_kerja: 'Dinas Komunikasi dan Informatika (Kominfo)',
                    catatan_pengantar: 'Memiliki kemampuan adaptasi tinggi terhadap infrastruktur PDN dan mampu bekerja di bawah tekanan tenggat waktu proyek strategis daerah.'
                },
                {
                    jabatan: 'Mobile Developer',
                    uraian: 'Mengembangkan aplikasi absensi berbasis pengenalan wajah (Face Recognition) dan mengoptimalkan performa aplikasi pada perangkat Android low-end.',
                    lama_kerja: '1 Tahun 8 Bulan',
                    pemberi_kerja: 'Badan Kepegawaian Daerah (BKD)',
                    catatan_pengantar: 'Sangat teliti dalam keamanan data biometrik dan memiliki pemahaman mendalam mengenai limitasi hardware perangkat mobile.'
                },
                {
                    jabatan: 'Backend Engineer',
                    uraian: 'Membangun arsitektur database untuk sistem manajemen aset daerah (e-Aset) sesuai dengan standar regulasi Permendagri.',
                    lama_kerja: '1 Tahun 2 Bulan',
                    pemberi_kerja: 'Sekretariat Daerah (SETDA)',
                    catatan_pengantar: 'Mampu menerjemahkan regulasi teknis pemerintahan ke dalam skema database yang efisien dan terstruktur.'
                },
                {
                    jabatan: 'System Administrator',
                    uraian: 'Mengelola server Nginx, konfigurasi Docker, dan melakukan migrasi database SQL Server untuk sistem keuangan desa (Siskeudes).',
                    lama_kerja: '3 Tahun',
                    pemberi_kerja: 'Dinas Pemberdayaan Masyarakat Desa (DPMD)',
                    catatan_pengantar: 'Ahli dalam troubleshooting server pada kondisi jaringan terbatas di area pelosok/pedesaan.'
                }
            ]
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        goAdd() {
            this.$router.push('/tambahPengalaman');
        },
        goEdit() {
            this.$router.push('/editPengalaman');
        }
    }
}
</script>
