<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Peraturan Daerah</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>
        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <div class="q-px-md q-pt-sm">
                    <div class="row q-col-gutter-sm">
                        <div class="col-8">
                            <q-input 
                                v-model="cari_value" 
                                dense outlined 
                                placeholder="Cari data..." 
                                class="search-input"
                                bg-color="grey-1"
                                @update:model-value="loadData"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="search" size="20px" />
                                </template>
                            </q-input>
                        </div>
                        
                        <div class="col-4">
                            <q-select 
                                v-model="tahun" 
                                :options="tahun" 
                                dense outlined 
                                option-value="id"
                                option-label="tahun"
                                bg-color="grey-1"
                                emit-value map-options
                                class="filter-year"
                                @update:model-value="loadData"
                            />

                            <q-select v-model="form.tahun" :options="$store.state.list_tahunx" option-value="id"
                           option-label="tahun" outlined square :dense="true" class="bg-white margin_btn" emit-value
                           map-options />
                        </div>
                    </div>
                </div>
                <q-list class="mulish q-pa-md">
                    <q-card 
                        v-for="(item, index) in jdih.produkHukum"
                        :key="index" 
                        class="q-mb-md cardPerda"
                    >
                        <q-card-section class="q-pa-md">
                            <div class="row justify-between items-center q-mb-sm">
                                <div v-if="item.status === 'Aktif'" class="text-positive text-caption text-weight-bolder">
                                    <q-icon name="check_circle" />
                                    Aktif
                                </div>
                                <div v-else class="text-negative text-caption text-weight-bolder">
                                    <q-icon name="cancel" />
                                    Tidak Aktif
                                </div>
                            </div>

                            <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-xs line-clamp-2">
                                {{ item.nama }}
                            </div>
                            <div class="text-caption text-grey-7 q-mb-sm">
                                <div class="text-primary text-weight-medium">Nomor: {{ item.nomor }} | Tahun: {{ item.tahun }}</div>
                                <div class="row items-center q-mt-xs">
                                    <q-icon name="r_account_balance" size="14px" class="q-mr-xs" />
                                    <span>Sumber: {{ item.sumber || 'Sekretariat Daerah' }}</span>
                                </div>
                            </div>

                            <q-separator inset class="q-my-sm" style="opacity: 0.5;" />

                            <div class="row items-center justify-between q-mt-sm">
                                <div class="row items-center text-grey-7">
                                    <q-icon name="r_location_on" size="16px" class="q-mr-xs" />
                                    <span class="text-caption">{{ item.tempat_terbit }}</span>
                                </div>
                                
                                <q-btn 
                                    flat dense 
                                    color="primary" 
                                    icon="r_description" 
                                    label="Lihat PDF" 
                                    class="text-capitalize text-caption"
                                    @click.stop="downloadFile(item.file)"
                                />
                            </div>
                        </q-card-section>
                    </q-card>

                    <div v-if="jdih.produkHukum.length === 0" class="text-center q-pa-xl">
                        <q-icon name="r_find_in_page" size="60px" color="grey-6" />
                        <div class="text-grey-6 q-mt-sm">Data tidak ditemukan</div>
                    </div>
                </q-list>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { useJdihStore } from 'stores/jdih'

export default {
    data() {
        return {
            cari_value: '',
            page_first: 1,
            page_last: 0,
            jenis: 'Peraturan Daerah',
            tahun: [
                { id: 2023, tahun: '2023'},
                { id: 2024, tahun: '2024'},
                { id: 2025, tahun: '2025'},
                { id: 2025, tahun: '2026'},
                { id: 2025, tahun: '2027'},
                { id: 2025, tahun: '2028'},
                ],
            }
    },
    computed: {
        jdih() {
            return useJdihStore()
        },
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        getBadgeColor(jenis) {
            const j = jenis.toLowerCase();
            if (j.includes('perda')) return 'indigo-7';
            if (j.includes('perbup')) return 'teal-7';
            return 'orange-8'; // Untuk Keputusan Bupati
        },
        lihatDetail(item) {
            console.log('Lihat Detail:', item.judul);
            // Navigasi ke halaman detail atau buka dialog
        },
        downloadFile(fileName) {
            console.log('Membuka file:', fileName);
        },

        loadData() {
            const payload = {
                data_ke: this.page_first,
                cari_value: this.cari_value,
                cari_jenis: 'Peraturan Daerah',
                cari_tahun: ''
            }
            // console.log("Data dikirim:", payload);

            this.jdih.fetchProdukHukum(payload)
        },
    },
    mounted() {
        this.loadData()
    }
}
</script>
