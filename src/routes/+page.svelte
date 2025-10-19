<script lang="ts">
    import { api } from '$lib/api';
    import { Background, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/base.css';
    import { onMount } from 'svelte';
    import '../app.css';
    import ConnectionIndicator from '../components/ConnectionIndicator.svelte';
    import Console from '../components/Console.svelte';
    import ControlPanel from '../components/ControlPanel.svelte';
    import Node from '../components/Node.svelte';
    import WelcomeModal from '../components/WelcomeModal.svelte';

    import { handleConnect, handleDelete } from '$lib/handlers';
    import { appState } from '$lib/state.svelte';

    onMount(() => api.loadGraph());
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
        <ControlPanel />
        <Console />
    </SvelteFlow>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }
</style>
