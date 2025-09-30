<script module lang="ts">
    export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | null;
</script>

<script lang="ts">
    import { appState } from '$lib/state.svelte';
</script>

{#if appState.connectionState === 'connected'}
    <span style="color: lightgreen">Connected</span>
{:else if appState.connectionState === 'disconnected'}
    <span style="color: red">Disconnected</span>
{:else if appState.connectionState === 'connecting'}
    <span style="color: grey">Connecting...</span>
{:else}
    <span style="color: red">Unknown</span>
{/if}
