<script setup lang="ts">
import { ref, watch } from 'vue';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
});

const chartContainer = ref<HTMLElement | null>(null);
const getCode = () => {
  return localStorage.getItem('mermaide.code');
};
const saveCode = (c: string) => {
  localStorage.setItem('mermaide.code', c);
};

const code = ref(getCode() || '');
watch(code, () => {
  renderChart();
  saveCode(code.value || '');
});

const renderChart = async () => {
  if (!chartContainer.value) return;
  
  try {
    const { svg } = await mermaid.render('mermaid-chart', code.value);
    chartContainer.value.innerHTML = svg;
  } catch (error) {
    console.error('Mermaid rendering error:', error);
  }
};
</script>

<template>
  <div>
    <el-splitter>
      <el-splitter-panel size="30%">
        <textarea class="panel" v-model="code" placeholder="Enter Mermaid code here"></textarea>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <div ref="chartContainer" class="chart"></div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style scoped>
.panel {
  width: 100%;
  height: 100vh;
}
</style>
