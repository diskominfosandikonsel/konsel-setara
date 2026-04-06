<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer"
                            @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Detil Data</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #F6F6F6;">
                <div class="row q-col-gutter-md flex flex-center" style="margin-top: 20px;">
                    <q-card class="cardBiodata q-pa-md">
                        <div class="col-12 col-md-8">
                            <q-list class="">
                                <q-item class="q-py-md border-bottom row items-start">
                                    <q-item-section class="col-4 labelData">
                                        Jenjang Pendidikan
                                    </q-item-section>
                                    <q-item-section class="col-8 valueData">
                                        STRATA - 1
                                    </q-item-section>
                                </q-item>
                                <q-item class="q-py-md border-bottom row items-start">
                                    <q-item-section class="col-4 labelData">
                                        Nama Sekolah
                                    </q-item-section>
                                    <q-item-section class="col-8 valueData">
                                        UNIVERSITAS HALU OLEO
                                    </q-item-section>
                                </q-item>
                                <q-item class="q-py-md border-bottom row items-start">
                                    <q-item-section class="col-4 labelData">
                                        Tahun Lulus
                                    </q-item-section>
                                    <q-item-section class="col-8 valueData">
                                        2023
                                    </q-item-section>
                                </q-item>
                                <q-item class="q-py-md border-bottom row items-start">
                                    <q-item-section class="col-4 labelData">
                                        Alamat Sekolah
                                    </q-item-section>
                                    <q-item-section class="col-8 valueData">
                                        Jl. HEA Mokodompit No. G-4, Kendari
                                    </q-item-section>
                                </q-item>
                                <q-item class="q-py-md border-bottom row items-start">
                                    <q-item-section class="col-4 labelData">
                                        Nilai / IPK
                                    </q-item-section>
                                    <q-item-section class="col-8 valueData">
                                        3.75
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </div>
                    </q-card>
                </div>
            </q-page>
        </q-page-container>

    </q-layout>
</template>

<script>
export default {
    name: 'DetilePendidikan',
    data() {
        return {

        }
    },
    methods: {
        goBack() {
            this.$router.back()
        }
    }
}
</script>

<style></style>
