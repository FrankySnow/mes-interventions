<script setup lang="ts">
import { provideAuthActor } from 'src/actors/useAuthActor'

provideAuthActor()
</script>

<template>
  <router-view />
</template>
