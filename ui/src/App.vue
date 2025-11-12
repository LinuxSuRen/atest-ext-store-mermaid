<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import mermaid from 'mermaid';
import { toPng } from 'html-to-image';

mermaid.initialize({
  startOnLoad: true,
  securityLevel: 'loose',
  flowchart: { htmlLabels: true },
});

const chartContainer = ref<HTMLElement | null>(null);
const getCode = () => {
  return localStorage.getItem('mermaide.code');
};
const saveCode = (c: string) => {
  localStorage.setItem('mermaide.code', c);
};

const handleMermaidClick = (elementId: string) => {
  console.log('Mermaid element clicked:', elementId);
};

(window as any).handleMermaidClick = handleMermaidClick;

const code = ref('');
watch(code, () => {
  renderChart();
  saveCode(code.value || '');
});

const leftPanelRef = ref<HTMLElement | null>(null);
const renderChart = async () => {
  if (!chartContainer.value) return;
  
  try {
    chartContainer.value.innerHTML = '';
    const { svg, bindFunctions } = await mermaid.render('mermaid-chart', code.value);
    chartContainer.value.innerHTML = svg;
    if (bindFunctions) {
      bindFunctions(chartContainer.value);
    }
    chartContainer.value.ondrag = (e) => {
      e.preventDefault();
      if (e.clientX === 0 && e.clientY === 0) return;
      xMove.value = e.clientX - leftPanelRef.value?.$el.offsetWidth || 0;
      yMove.value = e.clientY;
    };
  } catch (error) {
    console.error('Mermaid rendering error:', error);
  }

  svgTransform();
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
const xMove = ref(50);
const yMove = ref(0);
const svgTransform = () => { 
  const svgElement = chartContainer.value?.querySelector('svg');
  if (!svgElement) return;
  svgElement.style.transform = `translateX(${xMove.value}px) translateY(${yMove.value}px) scale(${zoom.value/100.0})`;
}
watch(zoom, svgTransform)
watch(xMove, svgTransform)
watch(yMove, svgTransform)

onMounted(() => {
  code.value = getCode() || '';
})

const maxZoom = 200;
const maxHeight = window.innerHeight;
const maxWidth = window.innerWidth;
</script>

<template>
  <div>
    <el-splitter>
      <el-splitter-panel size="20%">
        <el-form ref="leftPanelRef">
          <el-form-item label="Sample">
            <el-select v-model="sampleCodeType" placeholder="Select diagram type">
              <el-option v-for="type in diagramTypes" :key="type" :label="type" :value="type">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <textarea class="panel" v-model="code" placeholder="Enter Mermaid code here"></textarea>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <el-button @click="exportToPng" type="primary" style="margin: 10px;">Export as PNG</el-button>
        <div ref="chartContainer" class="chart"></div>
        <div style="display: flex;">
          <span style="margin-right: 8px;">Zoom:</span><el-slider v-model="zoom" :max="maxZoom" />
        </div>
        <div style="display: flex;">
          <span style="margin-right: 8px;">X:</span><el-slider v-model="xMove" :max="maxWidth" />
        </div>
        <div style="display: flex;">
          <span style="margin-right: 8px;">Y:</span><el-slider v-model="yMove" :max="maxHeight" />
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style scoped>
.panel {
  width: 100%;
  height: calc(100vh - 58px);
}
.chart {
  height: calc(100vh - 160px);
}
</style>
