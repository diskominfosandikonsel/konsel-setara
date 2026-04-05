<template>
    <q-layout view="hHh lpR fFf">

        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer"
                            @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Pendidikan Formal</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <div class="row items-center q-gutter-y-md" style="margin-top: 48px;">
                    <q-card v-for="(item, index) in listPendidikan" :key="index" class="cardPendidikan q-pa-sm">
                        <div class="row items-center no-wrap">

                            <div class="col-auto q-mr-md">
                                <q-img src="/img/perak/file.png" style="width: 35px; height: 35px;" />
                            </div>

                            <div class="col">
                                <div class="judul">{{ item.jenjang }}</div>
                                <div class="subJudul">{{ item.namaSekolah }}</div>
                            </div>

                            <div class="col-auto">
                                <q-btn flat round color="grey-7" icon="r_settings" size="14px">
                                    <q-menu auto-close transition-show="scale" transition-hide="scale"
                                        class="menu-setting">
                                        <q-list style="min-width: 120px">

                                            <q-item clickable @click="goEdit">
                                                <q-item-section>
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
                    </q-card>
                </div>
                <div class="divBtn flex flex-center" @click="goAdd">
                    <q-icon name="r_add" color="white" size="40px" />
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>

export default {
    name: 'biodata',
    data() {
        return {
            listPendidikan: [
                { jenjang: 'SEKOLAH DASAR', namaSekolah: 'SDN NEGERI 13 WUA-WUA' },
                { jenjang: 'SEKOLAH MENENGAH PERTAMA', namaSekolah: 'SMP NEGERI 9 KENDARI' },
                { jenjang: 'SEKOLAH MENENGAH ATAS', namaSekolah: 'SMA NEGERI 4 KENDARI' },
                { jenjang: 'STRATA - 1', namaSekolah: 'UNIVERSITAS HALU OLEO' }
            ]
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        goAdd() {
            this.$router.push('/tambahBiodata');
        },
        goEdit() {
            this.$router.push('/editBiodata');
        }
    }
}
</script>
