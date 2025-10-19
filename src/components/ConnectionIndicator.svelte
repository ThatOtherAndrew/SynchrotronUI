<script module lang="ts">
    export type ConnectionState = 'connecting' | 'connected' | 'disconnected';
</script>

<script lang="ts">
    import { Panel } from '@xyflow/svelte';
    import { fly } from 'svelte/transition';

    let { connectionState }: { connectionState: ConnectionState } = $props();

    let displayConnectionState = $derived(
        connectionState[0].toUpperCase() + connectionState.slice(1)
    );

    let measureElements: Record<ConnectionState, HTMLSpanElement | undefined> = $state({
        connecting: undefined,
        connected: undefined,
        disconnected: undefined
    });

    let widths = $state<Record<ConnectionState, number>>({
        connecting: 0,
        connected: 0,
        disconnected: 0
    });

    $effect(() => {
        const states: ConnectionState[] = ['connecting', 'connected', 'disconnected'];
        states.forEach((state) => {
            const element = measureElements[state];
            if (element) {
                widths[state] = element.offsetWidth;
            }
        });
    });

    let targetWidth = $derived(widths[connectionState]);
</script>

<Panel position="top-left">
    <div class="indicator {connectionState}">
        <span class="circle"></span>
        <div class="label-container" style:width={targetWidth ? `${targetWidth}px` : 'auto'}>
            {#key connectionState}
                <span
                    class="label"
                    in:fly={{ y: 10, duration: 200, delay: 150 }}
                    out:fly={{ y: -10, duration: 150 }}
                >
                    {displayConnectionState}
                </span>
            {/key}
        </div>
    </div>

    <!-- Hidden measurement elements -->
    <span class="label measure" bind:this={measureElements.connecting}>Connecting</span>
    <span class="label measure" bind:this={measureElements.connected}>Connected</span>
    <span class="label measure" bind:this={measureElements.disconnected}>Disconnected</span>
</Panel>

<style lang="scss">
    @use 'sass:color';

    .indicator {
        display: flex;
        align-items: center;
        gap: 0.5em;
        padding: 0.4em 0.8em;
        border-radius: 999em;
        overflow: hidden;

        color: lightgrey;
        background-color: rgba(dimgrey, 0.75);
        backdrop-filter: blur(4px);
        transition:
            color 0.5s ease,
            background-color 0.5s ease;

        &.connected {
            color: limegreen;
            background-color: rgba(darkgreen, 0.75);
        }

        &.disconnected {
            color: red;
            background-color: rgba(color.adjust(darkred, $lightness: -10%), 0.75);
        }
    }

    .circle {
        width: 0.75em;
        height: 0.75em;
        border-radius: 50%;
        background: currentColor;
    }

    .label-container {
        display: grid;
        transition: width 0.3s ease;

        > * {
            grid-area: 1 / 1;
        }
    }

    .label.measure {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        white-space: nowrap;
    }
</style>
