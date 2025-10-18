<script module lang="ts">
    export type ConnectionState = 'connecting' | 'connected' | 'disconnected';
</script>

<script lang="ts">
    import { Panel } from '@xyflow/svelte';

    let { connectionState }: { connectionState: ConnectionState } = $props();

    let displayConnectionState = $derived(
        connectionState[0].toUpperCase() + connectionState.slice(1)
    );
</script>

<Panel position="top-left">
    <div class="indicator {connectionState}">
        <span class="circle"></span>
        <span class="label">{displayConnectionState}</span>
    </div>
</Panel>

<style lang="scss">
    .indicator {
        display: flex;
        align-items: center;
        gap: 0.5em;
        padding: 0.4em 0.8em;
        border-radius: 999em;

        color: lightgrey;
        background-color: rgba(dimgrey, 0.75);
        backdrop-filter: blur(4px);

        &.connected {
            color: limegreen;
            background-color: rgba(darkgreen, 0.75);
        }

        &.disconnected {
            color: red;
            background-color: rgba(darken(darkred, 10%), 0.75);
        }
    }

    .circle {
        width: 0.75em;
        height: 0.75em;
        border-radius: 50%;
        background: currentColor;
    }
</style>
