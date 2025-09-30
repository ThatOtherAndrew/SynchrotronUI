<script module lang="ts">
    export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | null;
</script>

<script lang="ts">
    let { connectionState }: { connectionState: ConnectionState } = $props();
</script>

{#if connectionState === 'connected'}
    <span style="color: lightgreen">Connected</span>
{:else if connectionState === 'disconnected'}
    <span style="color: red">Disconnected</span>
{:else if connectionState === 'connecting'}
    <span style="color: grey">Connecting...</span>
{:else}
    <span style="color: red">Unknown</span>
{/if}
