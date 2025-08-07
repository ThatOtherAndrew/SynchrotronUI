<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import {
        SvelteFlow,
        Controls,
        Background,
        MiniMap,
        Panel,
        type Node,
        type Edge,
        type ColorMode,
        type Connection,
        type XYPosition,
    } from "@xyflow/svelte";

    import "@xyflow/svelte/dist/style.css";
    import ConnectionState from "./ConnectionState.svelte";
    import Console from "./Console.svelte";

    import SynchrotronNode from "./SynchrotronNode.svelte";
    import type { components } from "../types/api";

    const demoNodePositions = {
        pwm_mod_freq: { x: -210.10438468246025, y: 7.105427357601002e-15 },
        scale_val: { x: -6.595204900346246, y: 60.2990162317375 },
        pwm_mod: { x: -1.4210854715202004e-14, y: -1.8843442572417892 },
        offset_val: { x: 191.26094211004227, y: 90.44852434760621 },
        scale: { x: 189.37659785280047, y: 32.03385237311053 },
        freq: { x: 8.479549157588025, y: -138.499302907272 },
        offset: { x: 388.17491699181005, y: 56.53032771725388 },
        square: { x: 188.43442572417973, y: -125.30889310657945 },
        out: { x: 398.34627013554643, y: -131.6727865214093 },
        text1: { x: 7.582207663078407, y: -392.2850608521532 },
        text2: { x: -145.93059693834104, y: -339.0080021182999 },
        text3: { x: -48.269351294989704, y: -289.6161077699383 },
    };

    const demoScript = `\
        clear;

        new "Heya! Welcome to the Synchrotron demo." text1;
        new "Press <Start> in the top right to hear the below example PWM synth. [WARNING: Loud!]" text2;
        new "Try editing the graph and observe how the sound changes!" text3;

        new 0.2 pwm_mod_freq;
        new 0.24 scale_val;
        new SineNode pwm_mod;
        new 0.75 offset_val;
        new MultiplyNode scale;
        new 440 freq;
        new AddNode offset;
        new SquareNode square;
        new PlaybackNode out;

        link square.out -> out.left;
        link square.out -> out.right;
        link pwm_mod_freq.out -> pwm_mod.frequency;
        link pwm_mod.out -> scale.a;
        link scale_val.out -> scale.b;
        link scale.out -> offset.a;
        link offset_val.out -> offset.b;
        link freq.out -> square.frequency;
        link offset.out -> square.pwm;
    `;

    async function loadDemo() {
        $nodePositions = demoNodePositions;
        await fetch("http://localhost:2031/execute", {
            method: "POST",
            body: demoScript,
        });
        await loadGraph();
    }

    async function testConnection() {
        try {
            const response = await fetch("http://localhost:2031", {
                signal: AbortSignal.timeout(1000),
            });
            isServerConnected =
                response.ok &&
                (await response.json()) === "Synchrotron server running";
        } catch {
            isServerConnected = false;
        }
    }

    async function getAllNodes() {
        const response = await fetch("http://localhost:2031/nodes");
        const nodeData: components["schemas"]["Node"][] = await response.json();
        return nodeData.map((node) => ({
            type: "synchrotron_node",
            id: node.name,
            position: $nodePositions[node.name] || { x: 0, y: 0 },
            data: { nodeData: writable(node) },
        }));
    }

    async function getAllEdges(): Promise<Edge[]> {
        const response = await fetch("http://localhost:2031/connections");
        const connectionData: components["schemas"]["Connection"][] =
            await response.json();
        return connectionData.map((connection) => ({
            id:
                `${connection.source.node_name}.${connection.source.port_name}` +
                `->${connection.sink.node_name}.${connection.sink.port_name}`,
            source: connection.source.node_name,
            sourceHandle: connection.source.port_name,
            target: connection.sink.node_name,
            targetHandle: connection.sink.port_name,
        }));
    }

    async function startRendering() {
        isRendering = true;
        await fetch("http://localhost:2031/start");
    }

    async function stopRendering() {
        isRendering = false;
        await fetch("http://localhost:2031/stop");
    }

    async function onConnect(connection: Connection) {
        await fetch("http://localhost:2031/connections", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                source: {
                    node_name: connection.source,
                    port_name: connection.sourceHandle,
                },
                sink: {
                    node_name: connection.target,
                    port_name: connection.targetHandle,
                },
            }),
        });
    }

    async function onDelete(params: { nodes: Node[]; edges: Edge[] }) {
        for (const node of params.nodes) {
            await fetch(`http://localhost:2031/nodes/${node.id}`, {
                method: "DELETE",
            });
        }
        for (const edge of params.edges) {
            await fetch("http://localhost:2031/connections", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: {
                        node_name: edge.source,
                        port_name: edge.sourceHandle,
                    },
                    sink: {
                        node_name: edge.target,
                        port_name: edge.targetHandle,
                    },
                }),
            });
        }
    }

    async function loadGraph() {
        $nodes = await getAllNodes();
        $edges = await getAllEdges();
    }

    async function resetGraph() {
        $nodePositions = {};
        await loadGraph();
    }

    async function clearGraph() {
        await fetch("http://localhost:2031/clear");
        await loadGraph();
    }

    async function saveFile() {
        const response = await fetch("http://localhost:2031/export");
        let fileContent = `/***\n${JSON.stringify($nodePositions)}\n***/\n\n${await response.json()}`;
        const url = URL.createObjectURL(
            new Blob([fileContent], { type: "text/plain" }),
        );

        const a = document.createElement("a");
        a.href = url;
        a.download = "synchrotron_scene.sui";
        a.click();

        URL.revokeObjectURL(url);
    }

    async function loadFile() {
        if (files === undefined) return;

        const fileContent = await files[0].text();
        const nodePositionRegex: RegExp =
            /(?<=\/\*\*\*)\s*{.*}\s*(?=\*\*\*\/)/m;
        const nodePositionsString = fileContent.match(nodePositionRegex);
        if (nodePositionsString) {
            $nodePositions = JSON.parse(nodePositionsString[0].trim());
        }

        await fetch("http://localhost:2031/execute", {
            method: "POST",
            body: `clear;\n\n${fileContent}`,
        });
        await loadGraph();
    }

    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);
    let isServerConnected: boolean | undefined;
    let isRendering = false;
    let theme: ColorMode = "system";
    let files: FileList | undefined;

    type NodePositions = { [key: string]: XYPosition };
    const nodePositions = writable<NodePositions>(
        JSON.parse(localStorage.getItem("nodePositions") || "{}"),
    );
    $: localStorage.setItem("nodePositions", JSON.stringify($nodePositions));

    $: {
        $edges.forEach((edge) => (edge.animated = isRendering));
        $edges = $edges;
    }

    onMount(async function () {
        await testConnection();
        setInterval(testConnection, 2000);
        await loadGraph();
        nodes.subscribe(() => {
            $nodePositions = Object.fromEntries(
                $nodes.map((node) => [node.id, node.position]),
            );
        });
    });
</script>

<SvelteFlow
    fitView
    {nodes}
    {edges}
    colorMode={theme}
    nodeTypes={{ synchrotron_node: SynchrotronNode }}
    defaultEdgeOptions={{
        style: "stroke: var(--xy-connectionline-stroke-default)",
    }}
    proOptions={{ hideAttribution: true }}
    onconnect={onConnect}
    ondelete={onDelete}
>
    <Controls />
    <Background />
    <MiniMap />

    <Panel style="color: var(--xy-node-color-default)">
        Synchrotron v0.1.0 (<a href="/docs">Documentation</a>) (<a
            href="https://github.com/ThatOtherAndrew/Synchrotron/">Source</a
        >)
        <br />
        <br />
        Synchrotron Server: <ConnectionState {isServerConnected} />
        <br />
        Rendering:
        <button on:click={startRendering}>Start</button>
        <button on:click={stopRendering}>Stop</button>
        <br />
        Theme:
        <select bind:value={theme}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
        <br />
        Graph:
        <button on:click={loadGraph}>Reload</button>
        <button on:click={resetGraph}>Reset Positions</button>
        <button on:click={clearGraph}>Clear</button>
        <br />
        File:
        <div style="display: inline-block; vertical-align: top;">
            <input type="file" accept=".syn,.sui" bind:files />
            <br />
            <button on:click={saveFile}>Save</button>
            <button on:click={loadFile}>Load</button>
        </div>
    </Panel>
    <Console on:demo={loadDemo} on:reload={loadGraph} />
</SvelteFlow>
