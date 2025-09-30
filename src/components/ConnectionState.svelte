<script lang="ts">
    export let isServerConnected: boolean | undefined;
</script>

{#if isServerConnected === true}
    <span style="color: lightgreen">Connected</span>
{:else if isServerConnected === false}
    <span style="color: red">Disconnected</span>
{:else}
    <span style="color: grey">Unknown</span>
{/if}
