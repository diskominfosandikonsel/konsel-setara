<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Lampiran</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>
        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <q-list class="mulish q-pa-md">
                    <q-card v-for="(file, index) in listLampiran" :key="index" class="q-mb-md cardPengalaman q-pa-md">
                        <div class="row items-center no-wrap">
                            <div class="col-auto q-mr-md">
                                <q-avatar 
                                    v-if="file.format.toLowerCase() === 'pdf'" 
                                    size="40px" 
                                    color="red-1" 
                                    text-color="negative" 
                                    icon="r_picture_as_pdf" 
                                />
                                
                                <q-avatar 
                                    v-else-if="['jpg', 'jpeg', 'png'].includes(file.format.toLowerCase())" 
                                    size="40px" 
                                    color="blue-1" 
                                    text-color="primary" 
                                    icon="r_image" 
                                />
                                
                                <q-avatar 
                                    v-else 
                                    size="40px" 
                                    color="grey-2" 
                                    text-color="grey-7" 
                                    icon="r_insert_drive_file" 
                                />
                            </div>
                            <div class="col">
                                <div class="text-weight-bold text-grey-9 ellipsis" style="font-size: 13px;">
                                    {{ file.nama_dokumen }}
                                </div>
                                <div class="text-caption text-grey-6">
                                    {{ file.ukuran }} • {{ file.format }}
                                </div>
                            </div>
                            <div class="col-auto">
                                <q-btn flat round color="grey-7" icon="r_settings" size="13px">
                                    <q-menu auto-close transition-show="scale" transition-hide="scale" class="menu-setting">
                                        <q-list style="min-width: 100px">
                                            <q-item clickable @click="previewFile(file)">
                                                <q-item-section avatar>
                                                    <q-icon name="r_visibility" color="primary" size="20px" />
                                                </q-item-section>
                                                <q-item-section>Lihat</q-item-section>
                                            </q-item>
                                            <q-separator />
                                            <q-item clickable @click="goEdit">
                                                <q-item-section avatar>
                                                    <q-icon name="r_edit" color="warning" size="20px" />
                                                </q-item-section>
                                                <q-item-section class="text-weight-medium">Edit</q-item-section>
                                            </q-item>

                                            <q-separator />
                                            <q-item clickable @click="hapusFile(index)">
                                                <q-item-section avatar>
                                                    <q-icon name="r_delete" color="negative" size="20px" />
                                                </q-item-section>
                                                <q-item-section class="text-negative">Hapus</q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-menu>
                                </q-btn>
                            </div>
                        </div>
                    </q-card>

                    <div v-if="listLampiran.length === 0" class="text-center q-pa-xl text-grey-6">
                        <q-icon name="r_cloud_off" size="50px" class="q-mb-sm" />
                        <div>Belum ada lampiran yang diunggah</div>
                    </div>
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
    name: 'Lampiran',
    data() {
        return {
            listLampiran: [
                { 
                    nama_dokumen: 'KTP_Muhammad_Hidayat.pdf', 
                    ukuran: '450 KB', 
                    format: 'PDF',
                    url: '#' 
                },
                { 
                    nama_dokumen: 'Ijazah_S1_Teknik_Informatika.pdf', 
                    ukuran: '1.2 MB', 
                    format: 'PDF',
                    url: '#' 
                },
                { 
                    nama_dokumen: 'Sertifikat_Fullstack_Dev.jpg', 
                    ukuran: '800 KB', 
                    format: 'JPG',
                    url: '#' 
                }
            ]
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        goAdd() {
            this.$router.push('/tambahLampiran');
        },
        goEdit() {
            this.$router.push('/editLampiran');
        },
        previewFile(file) {
            // Logika untuk membuka file
            window.open(file.url, '_blank')
        },
        hapusFile(index) {
            this.$q.dialog({
            title: 'Hapus Lampiran',
            message: 'Yakin ingin menghapus dokumen ini?',
            cancel: true,
            persistent: true
            }).onOk(() => {
            this.listLampiran.splice(index, 1)
            })
        }
    }
}
</script>
