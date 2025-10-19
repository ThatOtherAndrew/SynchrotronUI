<script lang="ts">
    import { Background, Controls, MiniMap, SvelteFlow, type OnConnect, type OnDelete } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/base.css';
    import '../app.css';
    import Node from '../components/Node.svelte';
    import { SynchrotronAPI, type Connection } from '$lib/api';
    import { onMount } from 'svelte';
    import WelcomeModal from '../components/WelcomeModal.svelte';
    import Console from '../components/Console.svelte';
    import ControlPanel from '../components/ControlPanel.svelte';

    import { appState } from '$lib/state.svelte';
    import ConnectionIndicator from '../components/ConnectionIndicator.svelte';

    let api = new SynchrotronAPI();

    onMount(() => api.loadGraph());

    const handleConnect: OnConnect = async (connection) => {
        if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
            return;
        }

        const apiConnection: Connection = {
            source: {
                node_name: connection.source,
                port_name: connection.sourceHandle
            },
            sink: {
                node_name: connection.target,
                port_name: connection.targetHandle
            }
        };

        try {
            await api.addConnection(apiConnection);
            await api.loadGraph();
        } catch (err) {
            console.error('Failed to add connection:', err);
        }
    };

    const handleDelete: OnDelete = async ({ nodes, edges }) => {
        try {
            // Delete nodes
            for (const node of nodes) {
                await api.removeNode(node.id);
            }

            // Delete edges
            for (const edge of edges) {
                if (!edge.source || !edge.target || !edge.sourceHandle || !edge.targetHandle) {
                    continue;
                }

                const apiConnection: Connection = {
                    source: {
                        node_name: edge.source,
                        port_name: edge.sourceHandle
                    },
                    sink: {
                        node_name: edge.target,
                        port_name: edge.targetHandle
                    }
                };

                await api.removeConnection(apiConnection);
            }

            await api.loadGraph();
        } catch (err) {
            console.error('Failed to delete nodes/edges:', err);
        }
    };
</script>

<main>
    <WelcomeModal />
    <SvelteFlow
        bind:nodes={appState.nodes}
        bind:edges={appState.edges}
        nodeTypes={{ synchrotron_node: Node }}
        colorMode={appState.theme}
        proOptions={{ hideAttribution: true }}
        onconnect={handleConnect}
        ondelete={handleDelete}
    >
        <Background />
        <Controls />
        <MiniMap />

        {#if appState.connectionState !== null}
            <ConnectionIndicator connectionState={appState.connectionState} />
        {/if}
        <ControlPanel {api} />
        <Console {api} />
    </SvelteFlow>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }
</style>
