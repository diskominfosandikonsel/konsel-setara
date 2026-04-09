<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Keputusan Kepala SKPD</span>
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
                                v-model="pilih_tahun" 
                                :options="tahun" 
                                :dense="true" outlined 
                                label="Pilih Tahun"
                                option-value="id"
                                option-label="tahun"
                                bg-color="grey-1"
                                emit-value map-options
                                class="filter-year"
                                @update:model-value="loadData"
                            />
                        </div>
                    </div>
                </div>
                <q-list class="mulish q-pa-md">
                    <q-infinite-scroll @load="onLoad" :offset="250" :disable="page_first >= jdih.jml_data">
                        <q-card 
                            v-for="(item, index) in jdih.produkHukum"
                            :key="index" 
                            class="q-mb-md cardPerda"
                        >
                            <q-card-section class="q-pa-md">
                                <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-xs line-clamp-2" @click="getDetil(item.id)">
                                    {{ item.nama }}
                                </div>
                                <div class="text-caption text-grey-7 q-mb-sm">
                                    <div class="text-primary text-weight-medium">Nomor: {{ item.nomor }} | Tahun: {{ item.tahun }}</div>
                                    <div class="row items-center q-mt-xs">
                                        <span>Sumber: {{ item.sumber || 'Sekretariat Daerah' }}</span>
                                    </div>
                                </div>

                                <q-separator inset class="q-my-sm" style="opacity: 0.5;" />

                                <div class="row items-center q-mt-sm">
                                    <div class="row items-center text-grey-7">
                                        <q-icon name="r_location_on" size="16px" class="q-mr-xs" />
                                        <span class="text-caption">{{ item.tempat_terbit }}</span>
                                    </div>
                                    <q-space />
                                    <div v-if="item.status === 'Aktif' || item.status === 'Berlaku'" class="text-positive text-caption text-weight-bolder">
                                        <q-icon name="check_circle" size="14px" class="q-mr-xs" />
                                        Berlaku
                                    </div>
                                    <div v-else class="text-negative text-caption text-weight-bolder">
                                        <q-icon name="cancel" size="14px" class="q-mr-xs" />
                                        Tidak Berlaku
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>

                        <template v-slot:loading>
                            <div class="row justify-center q-my-md">
                                <q-spinner-dots color="primary" size="40px" />
                            </div>
                        </template>
                    </q-infinite-scroll>

                    <div v-if="jdih.produkHukum.length === 0" class="justify-center items-center q-pa-md empty-container">
                        <q-img
                            src="/img/no_data.png"
                            fit="contain"
                            style="width: 120px; height: 120px;"
                            no-spinner
                        />
                        <div class="text-subtitle1 text-grey-6 q-mt-md text-weight-medium">
                            Tidak ada data ditemukan
                        </div>
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
            cari_tahun: '',
            page_first: 1,
            page_last: 0,
            jenis: 'Keputusan Kepala SKPD',
            pilih_tahun: null,
            tahun: [
                { id: 2027, tahun: '2027' },
                { id: 2026, tahun: '2026' },
                { id: 2025, tahun: '2025' },
                { id: 2024, tahun: '2024' },
                { id: 2023, tahun: '2023' },
                { id: 2022, tahun: '2022' },
                { id: 2021, tahun: '2021' },
                { id: 2020, tahun: '2020' },
                { id: 2019, tahun: '2019' },
                { id: 2018, tahun: '2018' },
                { id: 2017, tahun: '2017' },
                { id: 2016, tahun: '2016' },
                { id: 2015, tahun: '2015' },
                { id: 2014, tahun: '2014' },
                { id: 2013, tahun: '2013' },
                { id: 2012, tahun: '2012' },
                { id: 2011, tahun: '2011' },
                { id: 2010, tahun: '2010' },
                { id: 2009, tahun: '2009' },
                { id: 2008, tahun: '2008' },
                { id: 2007, tahun: '2007' },
                { id: 2006, tahun: '2006' },
                { id: 2005, tahun: '2005' }
            ],
        }
    },
    computed: {
        jdih() {
            return useJdihStore()
        },
    },
    watch: {
        cari_value() { this.loadData() },
        tahun_dipilih() { this.loadData() }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        getDetil(id) {
            this.$router.push({
                path: '/detilData',
                query: { id: id }
            });
        },

        async loadData() {
            const payload = {
                data_ke: parseInt(this.page_first) || 1,
                cari_value: this.cari_value,
                cari_jenis: this.jenis,
                cari_tahun: this.pilih_tahun || '',
            }
            // console.log("Data dikirim:", payload);
            await this.jdih.fetchProdukHukum(payload)
        },

        async onLoad(index, done){
            if (this.page_first >= this.jdih.jml_data) {
                done();
                return;
            }
            this.page_first++;
            const payload = {
                data_ke: this.page_first,
                cari_value: this.cari_value,
                cari_jenis: this.jenis,
                cari_tahun: this.pilih_tahun || '',
            };
            await this.jdih.fetchMoreProdukHukum(payload);
            done();
        },
    },
    mounted() {
        this.loadData()
    }
}
</script>
