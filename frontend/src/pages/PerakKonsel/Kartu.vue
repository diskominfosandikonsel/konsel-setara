<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Kartu Pencari Kerja</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #f8faff;">
                <q-card class="shadow-2 q-pa-md text-center" style="border-radius: 16px;">
                    <q-card-section>
                        <div class="q-mb-md">
                            <q-icon v-if="perak.biodata?.[0]?.status === '0' || perak.biodata?.[0]?.status === 0" name="hourglass_empty" size="64px" color="orange-8" />
                            <q-icon v-else-if="perak.biodata?.[0]?.status === '1' || perak.biodata?.[0]?.status === 1" name="cancel" size="72px" color="negative" />
                            <q-icon v-else-if="perak.biodata?.[0]?.status === '2' || perak.biodata?.[0]?.status === 2" name="check_circle" size="72px" color="positive" />
                        </div>
                        <div class="text-h6 text-weight-bold text-dark" style="line-height: 1.3;">
                            {{ statusTitle }}
                        </div>
                        <div class="text-body2 text-grey-7 q-mt-sm" style="line-height: 1.5; white-space: pre-wrap;">
                            {{ statusDescription }}
                        </div>
                    </q-card-section>
                    <q-card-actions align="center" class="q-mt-sm" v-if="perak.biodata?.[0]?.status === '2' || perak.biodata?.[0]?.status === 2">
                        <q-btn color="primary" icon="print" label="Cetak Kartu Kuning" class="full-width text-weight-bold" size="md" style="border-radius: 10px;" @click="downloadKartu" />
                    </q-card-actions>
                    <q-card-actions align="center" class="q-mt-sm" v-if="perak.biodata?.[0]?.status === '1' || perak.biodata?.[0]?.status === 1">
                        <q-btn outline color="primary" icon="edit" label="Perbaiki Data" class="full-width text-weight-bold" size="md" style="border-radius: 10px;" @click="$router.push('/perak_dashboard')" />
                    </q-card-actions>
                </q-card>
            </q-page>
        </q-page-container>

    </q-layout>
</template>

<script>
import { usePerakStore } from 'stores/perak'
import { useAuthStore } from 'stores/auth'
import { PerakService } from 'src/services/perak.service'

export default {
    name: 'KartuPencariKerja',
    data() {
        return {
            loading: false,
            page_first: 1,
            cari_value: ''
        }
    },
    computed: {
        perak() {
            return usePerakStore()
        },
        auth() {
            return useAuthStore()
        },
        status() {
            const backendStatus = this.perak.biodata?.[0]?.status;
            if (backendStatus === '0' || backendStatus === 0) return 'pending';
            if (backendStatus === '1' || backendStatus === 1) return 'rejected';
            if (backendStatus === '2' || backendStatus === 2) return 'accepted';
            return 'pending'; // default
        },
        statusTitle() {
            if (this.status === 'pending') return 'Menunggu Verifikasi';
            if (this.status === 'accepted') return 'Pendaftaran Disetujui';
            if (this.status === 'rejected') return 'Pendaftaran Ditolak';
            return '';
        },
        statusDescription() {
            if (this.status === 'pending') return 'Pendaftaran Anda telah kami terima dan sedang dalam proses verifikasi oleh petugas. Harap cek kembali secara berkala.';
            if (this.status === 'accepted') return 'Selamat! Data dan berkas Anda telah berhasil diverifikasi. Anda sekarang dapat mencetak Kartu Pencari Kerja (AK-1).';
            if (this.status === 'rejected') {
                const keterangan = this.perak.biodata?.[0]?.keterangan;
                const baseMessage = 'Mohon maaf, pendaftaran Anda ditolak';
                return keterangan ? `${baseMessage}\nAlasan: ${keterangan}` : baseMessage;
            }
            return '';
        },
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        async loadData() {
            const payload = {
                data_ke: this.page_first,
                cari_value: this.cari_value,
            }
            await this.perak.fetchBiodata(payload)
        },
        sanitizeFilename(name) {
            return String(name || 'pencari_kerja').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        },
        async downloadKartu() {
            if (!this.perak.biodata?.[0]?.id) {
                this.$q.notify({
                    type: 'warning',
                    message: 'Data biodata tidak ditemukan'
                });
                return;
            }

            const biodata = this.perak.biodata[0];
            const biodataId = biodata.id;
            const namaPencaker = biodata.nama || this.auth?.user?.nama || 'pencari_kerja';
            const safeName = this.sanitizeFilename(namaPencaker);
            const defaultUrl = `${this.perak.URL_APP}uploads/ak1_${biodataId}_${safeName}.pdf`;

            this.$q.loading.show({
                message: 'Memeriksa & menyiapkan berkas Kartu Kuning (AK-1)...'
            });

            try {
                // Request ke server perak untuk validasi apakah file sudah ada atau auto-generate baru
                const response = await PerakService.getKartuKuning(biodataId);
                if (response.data && response.data.fileName) {
                    const fileUrl = `${this.perak.URL_APP}uploads/${response.data.fileName}`;
                    window.open(fileUrl, '_blank');
                } else {
                    window.open(defaultUrl, '_blank');
                }
            } catch (error) {
                console.warn('Gagal memanggil endpoint laporan/query, menggunakan URL fallback:', error);
                window.open(defaultUrl, '_blank');
            } finally {
                this.$q.loading.hide();
            }
        },
    },
    mounted() {
        this.loadData()
    }
}
</script>

<style></style>
