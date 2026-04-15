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
                <div v-if="loading" class="flex flex-center q-pa-xl">
                    <q-spinner-dots color="primary" size="40px" />
                </div>
                <q-list class="mulish q-pa-md">
                    <template v-if="perak.pengalaman">
                        <q-card v-for="(data, index) in perak.pengalaman" :key="index" class="q-mb-md cardPengalaman q-pa-md">
                            <div class="row no-wrap items-start justify-between">
                                <div class="col">
                                    <div class="text-weight-bold textPrimary">{{ data.jabatan }}</div>
                                    <div class="text-caption text-weight-bold q-mb-sm text-grey-7">{{ data.pemberian_pengguna }}</div>
                                </div>
                                <div class="col-auto">
                                <q-btn flat round color="grey-7" icon="r_settings" size="12px">
                                    <q-menu auto-close transition-show="scale" transition-hide="scale" class="menu-setting">
                                        <q-list style="min-width: 120px">
                                            <q-item clickable @click="goEdit(data)">
                                                <q-item-section avatar>
                                                    <q-icon name="r_edit" color="warning" size="20px" />
                                                </q-item-section>
                                                <q-item-section class="text-weight-medium">Edit</q-item-section>
                                            </q-item>

                                            <q-separator />

                                            <q-item clickable @click="confirmDelete(data)">
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
                                <div class="col-8 text-caption">{{ data.lama_kerja }}</div>
                                <div class="col-4 text-caption text-grey-8">Uraian:</div>
                                <div class="col-8 text-caption">{{ data.pemberian_pengguna }}</div>
                                <div class="col-4 text-caption text-grey-8">Catatan:</div>
                                <div class="col-8 text-caption">{{ data.catatan }}</div>
                            </div>
                        </q-card>
                    </template>
                    <template v-else>
                        <div class="column flex-center q-pa-xl" style="min-height: 400px;">
                            <q-img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" style="width: 120px; opacity: 0.5;" />
                            <div class="text-h6 text-grey-5 q-mt-md">Data Belum Ada</div>
                            <div class="text-caption text-grey-4">Klik tombol + untuk menambah riwayat pendidikan</div>
                        </div>
                    </template>
                </q-list>
                <div class="divBtn flex flex-center" @click="goAdd">
                    <q-icon name="r_add" color="white" size="40px" />
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { usePerakStore } from 'stores/perak'

export default {
    name: 'PengalamanKerja',
    data() {
        return {
            loading: false,
            page_first: 1,
            cari_value: '',
            page_limit: 10,

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
    computed: {
        perak() {
            return usePerakStore()
        },
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        goAdd() {
            if (this.perak.biodata.length > 0) {
                const id = this.perak.biodata[0].id
                this.$router.push({
                    path: '/tambahPengalaman',
                    query: { b_id: id }
                });
            }
        },
        goEdit(item) {
            this.perak.selectData(item) 
            this.$router.push('/editPengalaman');
        },

        async loadData() {
            const payloadBio = {
                data_ke: this.page_first,
                cari_value: this.cari_value,
            }
            await this.perak.fetchBiodata(payloadBio);

            const payloadPengalaman = {
                biodata_id: this.perak.biodata[0].id,
                data_ke: this.page_first,
                cari_value: this.cari_value,
                limit: this.page_limit
            }
            await this.perak.fetchPengalaman(payloadPengalaman);
        },

        confirmDelete(data) {
            this.$q.dialog({
                title: 'Konfirmasi Hapus',
                message: 'Apakah Anda yakin ingin menghapus data?',
                cancel: {
                    color: 'grey',
                    label: 'Batal',
                    flat: true
                },
                ok: {
                    color: 'negative',
                    label: 'Hapus',
                    unelevated: true
                },
                persistent: true
            }).onOk(async () => {
                await this.perak.removePengalaman(data.id);
                this.loadData();
            })
        },
    },
    mounted() {
        this.loadData()
    }
}
</script>
