<script lang="ts">
    import { Handle, Position, type Node, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
    import type { components } from '../types/api';

    interface Data extends Record<string, unknown> {
        nodeData: Writable<components['schemas']['Node']>;
    }

    // noinspection JSUnusedGlobalSymbols
    type $$Props = NodeProps<Node<Data>>;

    export let data: Data;
    const { nodeData } = data;

    $$restProps;
</script>

<div class="node">
    <div class="handle-container inputs">
        {#each $nodeData.inputs as input}
            <Handle id={input.port_name} type="target" position={Position.Left} class="handle">
                <span class="handle-label">{input.port_name}</span>
            </Handle>
        {/each}
    </div>
    <div class="handle-container outputs">
        {#each $nodeData.outputs as output}
            <Handle id={output.port_name} type="source" position={Position.Right} class="handle">
                <span class="handle-label">{output.port_name}</span>
            </Handle>
        {/each}
    </div>

    <div class="node-content">
        <div class="header">
            <strong>{$nodeData.type}</strong> {$nodeData.name}
        </div>
        {#if (Object.keys($nodeData.exports).length)}
            <table class="exports">
                {#each Object.entries($nodeData.exports) as [key, value]}
                    <tr>
                        <th>{key}</th>
                        <td>&nbsp;=&nbsp;</td>
                        <td>{value}</td>
                    </tr>
                {/each}
            </table>
        {/if}
    </div>
</div>

<style lang="scss">
    .node {
        color: var(--colour-fg-default);
        background-color: var(--colour-bg-default);
        border-radius: .3rem;
        font-size: .7rem;
        overflow: clip;
        width: fit-content;
        height: fit-content;
    }

    .node-content > * {
        padding: .3em 1em;
    }

    .header {
        background-color: var(--colour-bg-accent);
    }

    .handle-container {
        position: absolute;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;

        :global(.handle) {
            position: static;
            margin: 5px 0;
        }
    }

    .handle-label {
        font-size: .5rem;
        color: var(--colour-fg-muted);
        position: absolute;
        bottom: .5em;
        font-style: italic;
        letter-spacing: -.05em;
    }

    .inputs {
        left: 0;
        :global(.handle) {
            transform: translate(-50%, 0);
        }
        .handle-label {
            right: 1em;
        }
    }

    .outputs {
        right: 0;
        :global(.handle) {
            transform: translate(50%, 0);
        }
        .handle-label {
            left: 1em;
        }
    }
</style>
