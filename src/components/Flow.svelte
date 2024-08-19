<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        Background,
        MiniMap,
        Panel,
        type Node,
        type Edge,
        type ColorMode,
        type Connection,
        type XYPosition,
    } from '@xyflow/svelte';

    import '@xyflow/svelte/dist/style.css';
    import Console from './Console.svelte';

    import SynchrotronNode from './SynchrotronNode.svelte';
    import type { components } from '../types/api';

    async function getAllNodes() {
        const response = await fetch('http://localhost:2031/nodes');
        const nodeData: components['schemas']['Node'][] = await response.json();
        return nodeData.map(node => ({
            type: 'synchrotron_node',
            id: node.name,
            position: $nodePositions[node.name] || { x: 0, y: 0 },
            data: { nodeData: writable(node) },
        }));
    }

    async function getAllEdges(): Promise<Edge[]> {
        const response = await fetch('http://localhost:2031/connections');
        const connectionData: components['schemas']['Connection'][] = await response.json();
        return connectionData.map(connection => ({
            id: (
                `${connection.source.node_name}.${connection.source.port_name}`
                + `->${connection.sink.node_name}.${connection.sink.port_name}`
            ),
            source: connection.source.node_name,
            sourceHandle: connection.source.port_name,
            target: connection.sink.node_name,
            targetHandle: connection.sink.port_name,
        }));
    }

    async function startRendering() {
        isRendering = true;
        await fetch('http://localhost:2031/start');
    }

    async function stopRendering() {
        isRendering = false;
        await fetch('http://localhost:2031/stop');
    }

    async function onConnect(connection: Connection) {
        await fetch('http://localhost:2031/connections', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: {
                    node_name: connection.source,
                    port_name: connection.sourceHandle,
                },
                sink: {
                    node_name: connection.target,
                    port_name: connection.targetHandle,
                },
            }),
        });
    }

    async function onDelete(params: { nodes: Node[], edges: Edge[] }) {
        for (const node of params.nodes) {
            await fetch(`http://localhost:2031/nodes/${node.id}`, { method: 'DELETE' });
        }
        for (const edge of params.edges) {
            await fetch('http://localhost:2031/connections', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: {
                        node_name: edge.source,
                        port_name: edge.sourceHandle,
                    },
                    sink: {
                        node_name: edge.target,
                        port_name: edge.targetHandle,
                    },
                }),
            });
        }
    }

    async function loadGraph() {
        $nodes = await getAllNodes();
        $edges = await getAllEdges();
    }

    async function resetGraph() {
        $nodePositions = {};
        await loadGraph();
    }

    async function saveFile() {
        const response = await fetch('http://localhost:2031/export');
        let fileContent = `/***\n${JSON.stringify($nodePositions)}\n***/\n\n${await response.json()}`;
        const url = URL.createObjectURL(new Blob([fileContent], { type: 'text/plain' }));

        const a = document.createElement('a');
        a.href = url;
        a.download = 'synchrotron_scene.sui';
        a.click();

        URL.revokeObjectURL(url);
    }

    async function loadFile() {
        if (files === undefined) return;

        const fileContent = await files[0].text();
        const nodePositionRegex: RegExp = /(?<=\/\*\*\*)\s*{.*}\s*(?=\*\*\*\/)/m;
        const nodePositionsString = fileContent.match(nodePositionRegex);
        if (nodePositionsString) {
            $nodePositions = JSON.parse(nodePositionsString[0].trim());
        }

        await fetch('http://localhost:2031/execute', { method: 'POST', body: fileContent });
        await loadGraph();
    }

    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);
    let isRendering = false;
    let theme: ColorMode = 'system';
    let files: FileList | undefined;

    type NodePositions = { [key: string]: XYPosition };
    const nodePositions = writable<NodePositions>(JSON.parse(localStorage.getItem('nodePositions') || '{}'));
    $: localStorage.setItem('nodePositions', JSON.stringify($nodePositions));

    $: {
        $edges.forEach(edge => edge.animated = isRendering);
        $edges = $edges;
    }

    onMount(async function () {
        await loadGraph();
        nodes.subscribe(() => {
            $nodePositions = Object.fromEntries($nodes.map(node => [node.id, node.position]));
        });
    });
</script>

<SvelteFlow
    fitView
    {nodes}
    {edges}
    colorMode={theme}
    nodeTypes={{ synchrotron_node: SynchrotronNode }}
    defaultEdgeOptions={{
        style: 'stroke: var(--xy-connectionline-stroke-default)',
    }}
    proOptions={{ hideAttribution: true }}

    onconnect={onConnect}
    ondelete={onDelete}
>
    <Controls />
    <Background />
    <MiniMap />

    <Panel style="color: var(--xy-node-color-default)">
        Rendering:
        <button on:click={startRendering}>Start</button>
        <button on:click={stopRendering}>Stop</button>
        <br>
        Theme:
        <select bind:value={theme}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
        <br>
        Graph:
        <button on:click={loadGraph}>Reload</button>
        <button on:click={resetGraph}>Reset</button>
        <br>
        File:
        <div style="display: inline-block; vertical-align: top;">
            <input type="file" accept=".syn,.sui" bind:files>
            <br>
            <button on:click={saveFile}>Save</button>
            <button on:click={loadFile}>Load</button>
        </div>
    </Panel>
    <Console on:reload={loadGraph} />
</SvelteFlow>
