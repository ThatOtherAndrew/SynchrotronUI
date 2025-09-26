<script>
    import { Background, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/base.css';
    import '../app.css';
    import Node from '../components/Node.svelte';
    import { writable } from 'svelte/store';
    import { api } from '$lib/api';
    import { onMount } from 'svelte';

    let nodes = $state.raw([]);
    let edges = $state.raw([]);
    let loading = $state(true);
    let error = $state(null);

    async function handleConnect(connection) {
        try {
            const newConnection = await api.addConnection({
                source: {
                    node_name: connection.source,
                    port_name: connection.sourceHandle,
                },
                sink: {
                    node_name: connection.target,
                    port_name: connection.targetHandle,
                },
            });

            const edgeId = `${newConnection.source.node_name}.${newConnection.source.port_name}->${newConnection.sink.node_name}.${newConnection.sink.port_name}`;
            edges = [
                ...edges,
                {
                    id: edgeId,
                    source: newConnection.source.node_name,
                    sourceHandle: newConnection.source.port_name,
                    target: newConnection.sink.node_name,
                    targetHandle: newConnection.sink.port_name,
                },
            ];
        } catch (err) {
            console.error('Failed to create connection:', err);
        }
    }

    async function handleDelete(params) {
        try {
            // Delete nodes from server
            for (const node of params.nodes) {
                await api.removeNode(node.id);
            }

            // Delete edges from server
            for (const edge of params.edges) {
                await api.removeConnection({
                    source: {
                        node_name: edge.source,
                        port_name: edge.sourceHandle,
                    },
                    sink: {
                        node_name: edge.target,
                        port_name: edge.targetHandle,
                    },
                });
            }
        } catch (err) {
            console.error('Failed to delete items:', err);
        }
    }

    onMount(async () => {
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
                position: {
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

            loading = false;
        } catch (err) {
            console.error('Failed to fetch data from server:', err);
            error = err.message || 'Failed to connect to server';
            loading = false;
        }
    });
</script>

<main>
    {#if loading}
        <div class="loading">Loading nodes from server...</div>
    {:else if error}
        <div class="error">Error: {error}</div>
    {:else}
        <SvelteFlow
            bind:nodes
            bind:edges
            nodeTypes={{ synchrotron_node: Node }}
            onconnect={handleConnect}
            ondelete={handleDelete}
        >
            <Background />
            <Controls />
            <MiniMap />
        </SvelteFlow>
    {/if}
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }

    .loading,
    .error {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-size: 1.2rem;
    }

    .error {
        color: #ff4444;
    }
</style>
