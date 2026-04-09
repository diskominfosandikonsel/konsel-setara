<template>
  <q-page class="flex flex-center">
    <div class="column items-center q-gutter-md">
      <div>hello Profil Page</div>
      <q-btn
        label="Edit Profile"
        color="primary"
        unelevated
        no-caps
        to="/edit_profile"
      />
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'ProfilPage',
}
</script>
