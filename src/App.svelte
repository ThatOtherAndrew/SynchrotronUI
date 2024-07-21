<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import {
        SvelteFlowProvider,
        SvelteFlow,
        Controls,
        Background,
        MiniMap,
        Panel,
        type Node,
        type Edge,
        type ColorMode,
        type Connection,
    } from '@xyflow/svelte';

    import '@xyflow/svelte/dist/style.css';

    import SynchrotronNode from './components/SynchrotronNode.svelte';
    import type { components } from './types/api';

    async function getAllNodes() {
        const response = await fetch('http://localhost:2031/nodes');
        const nodeData: components['schemas']['Node'][] = await response.json();
        return nodeData.map(node => ({
            type: 'synchrotron_node',
            id: node.name,
            position: { x: 0, y: 0 },
            data: { nodeData: writable(node) },
        }));
    }

    async function getAllEdges(): Promise<Edge[]> {
        const response = await fetch('http://localhost:2031/connections');
        const connectionData: components['schemas']['Connection'][] = await response.json();
        return connectionData.map(connection => ({
            id: connection.source.node_name + '->' + connection.sink.node_name,
            source: connection.source.node_name,
            sourceHandle: connection.source.port_name,
            target: connection.sink.node_name,
            targetHandle: connection.sink.port_name,
        }));
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

    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);
    let theme: ColorMode = 'system';

    onMount(async function () {
        $nodes = await getAllNodes();
        $edges = await getAllEdges();
    });
</script>

<main style:height="100vh">
    <SvelteFlowProvider>
        <SvelteFlow
            fitView
            {nodes}
            {edges}
            colorMode={theme}
            nodeTypes={{ synchrotron_node: SynchrotronNode }}
            defaultEdgeOptions={{
                animated: true,
                style: 'stroke: var(--xy-connectionline-stroke-default)',
            }}
            proOptions={{ hideAttribution: true }}

            onconnect={onConnect}
        >
            <Controls />
            <Background />
            <MiniMap />

            <Panel style="color: var(--xy-node-color-default)">
                Theme:
                <select bind:value={theme}>
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </Panel>
        </SvelteFlow>
    </SvelteFlowProvider>
</main>
