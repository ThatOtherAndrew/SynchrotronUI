<script lang="ts">
    import { Handle, Position } from '@xyflow/svelte';

    let { data } = $props();
    let { nodeData } = data;

    function hash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }
</script>

<div class="node" style:--node-hue={hash($nodeData.type)}>
    <div class="handle-container inputs">
        {#each $nodeData.inputs as input (input.port_name)}
            <Handle id={input.port_name} type="target" position={Position.Left} class="handle">
                <span class="handle-label">{input.port_name}</span>
            </Handle>
        {/each}
    </div>

    <div class="node-content">
        <div class="header">
            <strong>{$nodeData.type}</strong>
            {$nodeData.name}
        </div>
        {#if Object.keys($nodeData.exports).length}
            <table class="exports">
                <tbody>
                    {#each Object.entries($nodeData.exports) as [key, value] (key)}
                        <tr>
                            <th>{key}</th>
                            <td>&nbsp;=&nbsp;</td>
                            <td>{value}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>

    <div class="handle-container outputs">
        {#each $nodeData.outputs as output (output.port_name)}
            <Handle id={output.port_name} type="source" position={Position.Right} class="handle">
                <span class="handle-label">{output.port_name}</span>
            </Handle>
        {/each}
    </div>
</div>

<style lang="scss">
    .node {
        color: var(--colour-fg-default);
        font-size: 0.7rem;
        width: fit-content;
        height: fit-content;
        display: flex;
    }

    .node-content {
        background-color: hsl(var(--node-hue), var(--node-saturation), var(--node-lightness));
        border-radius: 0.3rem;
        overflow: clip;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .node-content > * {
        background-color: var(--colour-bg-default);
        width: 100%;
        padding: 0.3em 1em;
    }

    .header {
        background-color: transparent;
        width: max-content;
        text-align: center;
    }

    .handle-container {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;

        :global(.handle) {
            position: relative;
            inset: 0;
            margin: 3px 0;
        }
    }

    .handle-label {
        font-size: 0.5rem;
        /* color: var(--colour-fg-muted); */
        position: absolute;
        bottom: 0.5em;
        font-style: italic;
        letter-spacing: -0.05em;
        pointer-events: none;
    }

    .inputs {
        :global(.handle) {
            transform: translate(50%, 0);
        }
        .handle-label {
            right: 1em;
        }
    }

    .outputs {
        :global(.handle) {
            transform: translate(-50%, 0);
        }
        .handle-label {
            left: 1em;
        }
    }
</style>
