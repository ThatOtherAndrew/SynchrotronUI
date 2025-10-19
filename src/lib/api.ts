import { writable } from 'svelte/store';
import { appState } from './state.svelte';

export interface Port {
    node_name: string;
    port_name: string;
}

export interface Connection {
    source: Port;
    sink: Port;
}

export interface Input {
    node_name: string;
    port_name: string;
    type: string;
    source: Port | null;
}

export interface Output {
    node_name: string;
    port_name: string;
    type: string;
    sinks: Port[];
}

export interface Node {
    name: string;
    type: string;
    inputs: Input[];
    outputs: Output[];
    exports: Record<string, unknown>;
}

export class SynchrotronAPI {
    async loadGraph() {
        if (appState.connectionState !== 'connected') {
            appState.connectionState = 'connecting';
        }

        try {
            const [serverNodes, connections] = await Promise.all([
                this.getNodes(),
                this.getConnections(),
            ]);

            appState.nodes = serverNodes.map((node, index) => ({
                id: node.name,
                type: 'synchrotron_node',
                data: {
                    nodeData: writable(node),
                },
                position: appState.nodes.find(n => n.id === node.name)?.position || {
                    x: (index % 3) * 250,
                    y: Math.floor(index / 3) * 200,
                },
            }));

            appState.edges = connections.map(conn => ({
                id: `${conn.source.node_name}.${conn.source.port_name}->${conn.sink.node_name}.${conn.sink.port_name}`,
                source: conn.source.node_name,
                sourceHandle: conn.source.port_name,
                target: conn.sink.node_name,
                targetHandle: conn.sink.port_name,
            }));

            appState.connectionState = 'connected';
        } catch (err) {
            appState.connectionState = 'disconnected';
            console.error('Failed to fetch data from server:', err);
        }
    }

    async loadFile(files: FileList) {
        if (files === undefined) return;

        const fileContent = await files[0].text();
        // const nodePositionRegex: RegExp = /(?<=\/\*\*\*)\s*{.*}\s*(?=\*\*\*\/)/m;
        // const nodePositionsString = fileContent.match(nodePositionRegex);
        // if (nodePositionsString) {
        //     $nodePositions = JSON.parse(nodePositionsString[0].trim());
        // }

        await this.execute(`clear;\n\n${fileContent}`);
    }

    async execute(command: string): Promise<string> {
        const response = await fetch(`${appState.serverUrl}/execute`, {
            method: 'POST',
            body: command,
        });
        return response.json();
    }

    async startRendering(): Promise<null> {
        const response = await fetch(`${appState.serverUrl}/start`);
        return response.json();
    }

    async stopRendering(): Promise<null> {
        const response = await fetch(`${appState.serverUrl}/stop`);
        return response.json();
    }

    async clearGraph(): Promise<null> {
        const response = await fetch(`${appState.serverUrl}/clear`);
        return response.json();
    }

    async exportState(): Promise<string> {
        const response = await fetch(`${appState.serverUrl}/export`);
        return response.json();
    }

    async getNodes(): Promise<Node[]> {
        const response = await fetch(`${appState.serverUrl}/nodes`);
        if (!response.ok) {
            throw new Error(`Failed to fetch nodes: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    async createUnnamedNode(type: string): Promise<Node> {
        const response = await fetch(`${appState.serverUrl}/nodes?type=${encodeURIComponent(type)}`, {
            method: 'POST',
        });
        return response.json();
    }

    async getNodeByName(nodeName: string): Promise<Node> {
        const response = await fetch(`${appState.serverUrl}/nodes/${encodeURIComponent(nodeName)}`);
        return response.json();
    }

    async createNode(nodeName: string, type: string): Promise<Node> {
        const response = await fetch(
            `${appState.serverUrl}/nodes/${encodeURIComponent(nodeName)}?type=${encodeURIComponent(type)}`,
            {
                method: 'POST',
            }
        );
        return response.json();
    }

    async removeNode(nodeName: string): Promise<Node> {
        const response = await fetch(`${appState.serverUrl}/nodes/${encodeURIComponent(nodeName)}`, {
            method: 'DELETE',
        });
        return response.json();
    }

    async getConnections(): Promise<Connection[]> {
        const response = await fetch(`${appState.serverUrl}/connections`);
        if (!response.ok) {
            throw new Error(
                `Failed to fetch connections: ${response.status} ${response.statusText}`
            );
        }
        return response.json();
    }

    async addConnection(connection: Connection): Promise<Connection> {
        const response = await fetch(`${appState.serverUrl}/connections`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(connection),
        });
        return response.json();
    }

    async removeConnection(connection: Connection): Promise<Connection | null> {
        const response = await fetch(`${appState.serverUrl}/connections`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(connection),
        });
        return response.json();
    }
}

export const api = new SynchrotronAPI();
