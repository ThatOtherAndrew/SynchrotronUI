<script lang="ts">
    import {
        Background,
        Controls,
        MiniMap,
        SvelteFlow,
        type ColorMode,
        type Edge as EdgeData,
        type Node as NodeData,
    } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/base.css';
    import '../app.css';
    import Node from '../components/Node.svelte';
    import { writable } from 'svelte/store';
    import { SynchrotronAPI } from '$lib/api';
    import { onMount } from 'svelte';
    import WelcomeModal from '../components/WelcomeModal.svelte';
    import Console from '../components/Console.svelte';
    import ControlPanel from '../components/ControlPanel.svelte';
    import { type ConnectionState } from '../components/ConnectionIndicator.svelte';

    let nodes: NodeData[] = $state.raw([]);
    let edges: EdgeData[] = $state.raw([]);
    let connectionState: ConnectionState = $state(null);
    let theme: ColorMode = $state('system');

    let api = new SynchrotronAPI();

    async function loadGraph() {
        connectionState = 'connecting';
        try {
            const [serverNodes, connections] = await Promise.all([
                api.getNodes(),
                api.getConnections(),
            ]);

            nodes = serverNodes.map((node, index) => ({
                id: node.name,
                type: 'synchrotron_node',
                data: {
                    nodeData: writable(node),
                },
                position: nodes.find(n => n.id === node.name)?.position || {
                    x: (index % 3) * 250,
                    y: Math.floor(index / 3) * 200,
                },
            }));

            edges = connections.map(conn => ({
                id: `${conn.source.node_name}.${conn.source.port_name}->${conn.sink.node_name}.${conn.sink.port_name}`,
                source: conn.source.node_name,
                sourceHandle: conn.source.port_name,
                target: conn.sink.node_name,
                targetHandle: conn.sink.port_name,
            }));

            connectionState = 'connected';
        } catch (err) {
            connectionState = 'disconnected';
            console.error('Failed to fetch data from server:', err);
        }
    }

    onMount(loadGraph);
</script>

<main>
    <WelcomeModal />
    <SvelteFlow
        bind:nodes
        bind:edges
        nodeTypes={{ synchrotron_node: Node }}
        colorMode={theme}
        proOptions={{ hideAttribution: true }}
    >
        <Background />
        <Controls />
        <MiniMap />

        <ControlPanel bind:theme {api} {connectionState} {loadGraph} />
        <Console {api} onreload={loadGraph} />
    </SvelteFlow>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }
</style>
