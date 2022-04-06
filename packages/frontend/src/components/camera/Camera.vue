<template>
  <el-row>
    <el-col>
      <canvas ref="resultCanvas" :width="width" :height="height" />
    </el-col>
    <el-col>
      <select v-model="ht">
        <option v-for="item in options" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
      Current: {{ pipeline.frameTime }}, Avg: {{ timesAvg }}
    </el-col>
  </el-row>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useImageCapture } from "../../composables/useImageCapture";
import { useHTPipeline } from "../../composables/useHTPipeline";
import { HT } from "../../enums/HT.enum";

export default defineComponent({
  setup() {
    const width = 1280;
    const height = 720;
    const resultCanvas = shallowRef<HTMLCanvasElement | null>(null);
    const imageCapture = useImageCapture(width, height);

    const pipeline = useHTPipeline(resultCanvas, imageCapture.imageCapture);

    const times = ref<number[]>([]);
    const timesAvg = computed(() => {
      return times.value.reduce((a, b) => a + b, 0) / (times.value.length || 1);
    });

    watch(pipeline.frameTime, (time) => times.value.push(time));

    watch(
      pipeline.ht,
      async () => {
        pipeline.destroy();
        times.value = [];
        await nextTick();
        setTimeout(() => {
          pipeline.init();
        }, 1000);
      },
      { immediate: true }
    );

    onMounted(async () => {
      imageCapture.init();
    });

    onUnmounted(() => {
      pipeline.destroy();
      imageCapture.destroy();
    });

    return {
      pipeline,
      ht: pipeline.ht,
      resultCanvas,
      width,
      height,
      timesAvg,
      options: [
        { label: "SHTSimple_seq", value: HT.SHTSimple_seq },
        { label: "SHTSimpleLookup_seq", value: HT.SHTSimpleLookup_seq },
        { label: "SHTSimple_WASM", value: HT.SHTSimple_WASM },
        { label: "SHTSimpleLookup_WASM", value: HT.SHTSimpleLookup_WASM },
        {
          label: "SHTSimple_WASM_SIMD_impl",
          value: HT.SHTSimple_WASM_SIMD_impl,
        },
        {
          label: "SHTSimpleLookup_WASM_SIMD_impl",
          value: HT.SHTSimpleLookup_WASM_SIMD_impl,
        },
        {
          label: "SHTSimple_WASM_SIMD_expl",
          value: HT.SHTSimple_WASM_SIMD_expl,
        },
        {
          label: "SHTSimpleLookup_WASM_SIMD_expl",
          value: HT.SHTSimpleLookup_WASM_SIMD_expl,
        },
        { label: "SHTSimple_WASM_asm", value: HT.SHTSimple_WASM_asm },
        {
          label: "SHTSimpleLookup_WASM_asm",
          value: HT.SHTSimpleLookup_WASM_asm,
        },
        { label: "SHTSimple_workers", value: HT.SHTSimple_workers },
        { label: "SHTSimpleLookup_workers", value: HT.SHTSimpleLookup_workers },
        { label: "SHTSimple_gpu", value: HT.SHTSimple_gpu },
        { label: "SHTSimpleLookup_gpu", value: HT.SHTSimpleLookup_gpu },
        { label: "CHTSimple_seq", value: HT.CHTSimple_seq },
        { label: "CHTSimple_WASM", value: HT.CHTSimple_WASM },
        {
          label: "CHTSimple_WASM_SIMD_impl",
          value: HT.CHTSimple_WASM_SIMD_impl,
        },
        {
          label: "CHTSimple_WASM_SIMD_expl",
          value: HT.CHTSimple_WASM_SIMD_expl,
        },
        { label: "CHTSimple_WASM_asm", value: HT.CHTSimple_WASM_asm },
        { label: "CHTSimple_workers", value: HT.CHTSimple_workers },
        { label: "CHTSimple_gpu", value: HT.CHTSimple_gpu },
      ],
    };
  },
});
</script>

<style scoped lang="scss"></style>
