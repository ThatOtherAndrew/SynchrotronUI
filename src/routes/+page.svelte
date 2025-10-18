<script lang="ts">
    import { Background, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/base.css';
    import '../app.css';
    import Node from '../components/Node.svelte';
    import { SynchrotronAPI } from '$lib/api';
    import { onMount } from 'svelte';
    import WelcomeModal from '../components/WelcomeModal.svelte';
    import Console from '../components/Console.svelte';
    import ControlPanel from '../components/ControlPanel.svelte';

    import { appState } from '$lib/state.svelte';
    import ConnectionIndicator from '../components/ConnectionIndicator.svelte';

    let api = new SynchrotronAPI();

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
