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

    {#each $nodeData.inputs as input}
        <Handle id={input.port_name} type="target" position={Position.Left} />
    {/each}
    {#each $nodeData.outputs as output}
        <Handle id={output.port_name} type="source" position={Position.Right} />
    {/each}
</div>

<style lang="scss">
    .node {
        color: var(--xy-node-color-default);
        background-color: #eee;
        border-radius: .3rem;
        font-family: 'JetBrains Mono', monospace;
        font-size: .7rem;
        overflow: clip;
        width: fit-content;

        > * {
            padding: .3em 1em;
        }
    }

    .header {
        background-color: #ccc;
    }

    :global(.svelte-flow.dark) {
        .node {
            background-color: #333
        }

        .header {
            background-color: #555;
        }
    }
</style>
