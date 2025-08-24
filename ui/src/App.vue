<script setup lang="ts">
import { ref, watch } from 'vue';
import mermaid from 'mermaid';
import { toPng } from 'html-to-image';

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

const sampleCodeType = ref('flowchart');
const diagramTypes = ['flowchart', 'sequenceDiagram', 'timeline', 'classDiagram',
  'journey', 'mindmap', 'gantt', 'pie', 'kanban', 'gitGraph', 'quadrantChart', 'xychart'];
watch(sampleCodeType, async () => {
  const sampleCode = await fetch('/data/' + sampleCodeType.value + '.txt', {
    headers: {
      'X-Extension-Name': 'mermaid',
    },
  });
  code.value = await sampleCode.text();
});

const exportToPng = async () => {
  const svgElement = chartContainer.value?.querySelector('svg');
  if (!svgElement) return;

  try {
    const dataUrl = await toPng(svgElement as HTMLElement);
    const link = document.createElement('a');
    link.download = 'diagram.png';
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Export failed:', error);
  }
};

const zoom = ref(100);
const xMove = ref(0);
const yMove = ref(0);
const svgTransform = () => { 
  const svgElement = chartContainer.value?.querySelector('svg');
  if (!svgElement) return;
  svgElement.style.transform = `translateX(${xMove.value*5}px) translateY(${yMove.value*5}px) scale(${zoom.value/100.0})`;
}
watch(zoom, svgTransform)
watch(xMove, svgTransform)
watch(yMove, svgTransform)
</script>

<template>
  <div>
    <el-splitter>
      <el-splitter-panel size="30%">
        <el-select v-model="sampleCodeType" placeholder="Select diagram type">
          <el-option v-for="type in diagramTypes" :key="type" :label="type" :value="type">
          </el-option>
        </el-select>
        <textarea class="panel" v-model="code" placeholder="Enter Mermaid code here"></textarea>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <el-button @click="exportToPng" type="primary" style="margin: 10px;">Export as PNG</el-button>
        <div ref="chartContainer" class="chart"></div>
        <div style="display: flex;">
          <span style="margin-right: 8px;">Zoom:</span><el-slider v-model="zoom" :max="200" />
        </div>
        <div style="display: flex;">
          <span style="margin-right: 8px;">X:</span><el-slider v-model="xMove" />
        </div>
        <div style="display: flex;">
          <span style="margin-right: 8px;">Y:</span><el-slider v-model="yMove" />
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style scoped>
.panel {
  width: 100%;
  height: calc(100vh - 39px);
}
.chart {
  height: calc(100vh - 160px);
}
</style>
