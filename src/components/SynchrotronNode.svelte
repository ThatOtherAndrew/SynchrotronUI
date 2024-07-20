<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
    import type { components } from '../types/api';

    // noinspection JSUnusedGlobalSymbols
    type $$Props = NodeProps;

    export let data: { nodeData: Writable<components['schemas']['Node']> }
    const {nodeData} = data;

    $$restProps;
</script>

<div class="node">
  {#each $nodeData.inputs as input}
    <Handle id={input.port_name} type="target" position={Position.Left} />
  {/each}
  <div>
    <strong>{$nodeData.type}</strong> {$nodeData.name}
  </div>
  {#each $nodeData.outputs as output}
    <Handle id={output.port_name} type="source" position={Position.Right} />
  {/each}
</div>

<style>
    .node {
        padding: 1rem;
        background: #eee;
        border-radius: .3rem;
        font-size: 0.7rem;
    }
</style>
