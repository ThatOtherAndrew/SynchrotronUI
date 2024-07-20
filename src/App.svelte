<script lang="ts">
    import { writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        Background,
        MiniMap,
        type Node,
        type Edge,
    } from '@xyflow/svelte';

    import '@xyflow/svelte/dist/style.css';
    import { onMount } from 'svelte';
    import type { components } from './types/api';
    import SynchrotronNode from './components/SynchrotronNode.svelte';

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
            animated: true,
        }));
    }

    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);

    const nodeTypes = {
        synchrotron_node: SynchrotronNode,
    };

    const proOptions = {
        hideAttribution: true,
    };

    onMount(async function () {
        $nodes = await getAllNodes();
        $edges = await getAllEdges();
    });
</script>

<div style:height="100vh">
  <SvelteFlow {nodeTypes} {nodes} {edges} {proOptions} fitView>
    <Controls />
    <Background />
    <MiniMap />
  </SvelteFlow>
</div>
