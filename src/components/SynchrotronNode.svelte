<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
    import type { components } from '../types/api';

    type $$Props = NodeProps;

    export let data: Writable<components['schemas']['Node']>

    $$restProps;
</script>

<div class="colorpicker">
  {#each $data.inputs as input}
    <Handle id={input.port_name} type="target" position={Position.Left} />
  {/each}
  <div>
    <strong>{$data.type}</strong> {$data.name}
  </div>
  {#each $data.outputs as output}
    <Handle id={output.port_name} type="source" position={Position.Right} />
  {/each}
</div>
