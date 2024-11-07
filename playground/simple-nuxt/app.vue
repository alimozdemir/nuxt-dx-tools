<script setup lang="ts">
import ABC from '~/components/MyImportComponent.vue';

const { $dialog } = useNuxtApp();

const com = computed(() => '');

const call = $fetch('/api/myapi');

const call2 = $fetch('/api/mytest');


const call3 = $fetch('/api/mytest', {
  method: 'POST',
  body: JSON.stringify({ name: 'test' }),
});


</script>

<template>
  <div>
    <NuxtLoadingIndicator></NuxtLoadingIndicator>
    <NuxtRouteAnnouncer />
    <MyComponent></MyComponent>
    <my-component></my-component>
    <ABC></ABC>
    <Head></Head>
    <NuxtWelcome />

    <Folder></Folder>
    <FolderMyCode></FolderMyCode>

    <div v-if="useText()">
    </div>

    <div v-if="useTest()">
    </div>
  </div>
</template>
