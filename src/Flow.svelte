<script lang="ts">
    import { writable } from 'svelte/store';
    import ELK from 'elkjs/lib/elk.bundled.js';
    import {
        SvelteFlow,
        Controls,
        Background,
        MiniMap,
        Panel,
        Position,
        useSvelteFlow,
        type Node,
        type Edge,
        type ColorMode,
    } from '@xyflow/svelte';

    import { onMount } from 'svelte';
    import type { components } from './types/api';
    import SynchrotronNode from './components/SynchrotronNode.svelte';

    import '@xyflow/svelte/dist/style.css';

    const { fitView } = useSvelteFlow();

    async function getAllNodes() {
        const response = await fetch('http://localhost:2031/nodes');
        const nodeData: components['schemas']['Node'][] = await response.json();
        return nodeData.map(node => ({
            type: 'synchrotron_node',
            id: node.name,
            position: { x: 0, y: 0 },
            data: { nodeData: writable(node) },
        }));
    }

    async function getAllEdges(): Promise<Edge[]> {
        const response = await fetch('http://localhost:2031/connections');
        const connectionData: components['schemas']['Connection'][] = await response.json();
        return connectionData.map(connection => ({
            id: connection.source.node_name + '->' + connection.sink.node_name,
            source: connection.source.node_name,
            sourceHandle: connection.source.port_name,
            target: connection.sink.node_name,
            targetHandle: connection.sink.port_name,
        }));
    }

    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);
    const elk = new ELK();
    let theme: ColorMode = 'system';

    function getLayoutedElements(nodes: Node[], edges: Edge[], options = {}) {
        const graph = {
            id: 'root',
            layoutOptions: options,
            children: nodes.map((node) => ({
                ...node,
                targetPosition: Position.Left,
                sourcePosition: Position.Right,

                // Hardcode a width and height for elk to use when layouting.
                width: node.width || 100,
                height: node.height || 50,
            })),
            edges: edges,
        };

        return elk
            .layout(graph)
            .then(layoutedGraph => ({
                nodes: layoutedGraph.children?.map(node => ({
                    ...node,
                    position: { x: node.x, y: node.y },
                })),

                edges: layoutedGraph.edges,
            }))
            .catch(console.error);
    }

    function onLayout() {
        const ns = $nodes;
        const es = $edges;
        const elkOptions = {
            'elk.direction': 'RIGHT',
            'elk.algorithm': 'layered',
            'elk.layered.spacing.nodeNodeBetweenLayers': '100',
            'elk.spacing.nodeNode': '80',
        };

        getLayoutedElements(ns, es, elkOptions).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            $nodes = layoutedNodes;
            $edges = layoutedEdges;

            fitView();

            window.requestAnimationFrame(() => fitView());
        });
    }

    onMount(async function () {
        $nodes = await getAllNodes();
        $edges = await getAllEdges();
    });
</script>

<div style:height="100vh">
    <SvelteFlow
        fitView
        {nodes}
        {edges}
        colorMode={theme}
        nodeTypes={{ synchrotron_node: SynchrotronNode }}
        defaultEdgeOptions={{
            animated: true,
            style: 'stroke: var(--xy-connectionline-stroke-default)',
      }}
        proOptions={{ hideAttribution: true }}
    >
        <Controls />
        <Background />
        <MiniMap />

        <Panel style="color: var(--xy-node-color-default)">
            Theme:
            <select bind:value={theme}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
            <button on:click={onLayout}>Auto arrange nodes</button>
        </Panel>
    </SvelteFlow>
</div>
