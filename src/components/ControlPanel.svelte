<script lang="ts">
    import { Panel } from '@xyflow/svelte';
    import ConnectionIndicator from './ConnectionIndicator.svelte';
    import type { SynchrotronAPI } from '$lib/api';
    import { appState } from '$lib/state.svelte';

    let { api }: { api: SynchrotronAPI } = $props();

    let files: FileList | undefined = $state();

    async function startRendering() {
        try {
            await api.startRendering();
        } catch (err) {
            console.error('Failed to start rendering:', err);
        }
    }

    async function stopRendering() {
        try {
            await api.stopRendering();
        } catch (err) {
            console.error('Failed to stop rendering:', err);
        }
    }

    async function resetGraph() {
        // Reset node positions by reloading
        await api.loadGraph();
    }

    async function clearGraph() {
        try {
            await api.clearGraph();
            await api.loadGraph();
        } catch (err) {
            console.error('Failed to clear graph:', err);
        }
    }

    async function saveFile() {
        try {
            const state = await api.exportState();
            const blob = new Blob([state], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'graph.syn';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to save file:', err);
        }
    }

    async function loadFile() {
        if (!files || files.length === 0) return;

        try {
            const file = files[0];
            const content = await file.text();
            await api.execute(content);
            await api.loadGraph();
        } catch (err) {
            console.error('Failed to load file:', err);
        }
    }
</script>

<div id="panel">
    <Panel>
        Synchrotron v0.1.0 (<a href="/docs">Documentation</a>) (<a
            href="https://github.com/ThatOtherAndrew/Synchrotron/">Source</a
        >)
        <br />
        <br />
        Rendering:
        <button onclick={startRendering}>Start</button>
        <button onclick={stopRendering}>Stop</button>
        <br />
        Theme:
        <select bind:value={appState.theme}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
        <br />
        Graph:
        <button onclick={() => api.loadGraph()}>Reload</button>
        <button onclick={resetGraph}>Reset Positions</button>
        <button onclick={clearGraph}>Clear</button>
        <br />
        File:
        <div id="fileSection">
            <input type="file" accept=".syn,.sui" bind:files />
            <br />
            <button onclick={saveFile}>Save</button>
            <button onclick={loadFile}>Load</button>
        </div>
    </Panel>
</div>

<style lang="scss">
    #panel {
        color: var(--xy-node-color-default);
    }

    #fileSection {
        display: inline-block;
        vertical-align: top;
    }
</style>
