<template>
  <Camera />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Camera from "./camera/Camera.vue";

export default defineComponent({
  components: { Camera },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped></style>
