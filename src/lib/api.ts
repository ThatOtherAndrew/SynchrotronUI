const API_BASE_URL = 'http://localhost:2031';

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

class SynchrotronAPI {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async execute(command: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/execute`, {
            method: 'POST',
            body: command,
        });
        return response.json();
    }

    async startRendering(): Promise<null> {
        const response = await fetch(`${this.baseUrl}/start`);
        return response.json();
    }

    async stopRendering(): Promise<null> {
        const response = await fetch(`${this.baseUrl}/stop`);
        return response.json();
    }

    async clearGraph(): Promise<null> {
        const response = await fetch(`${this.baseUrl}/clear`);
        return response.json();
    }

    async exportState(): Promise<string> {
        const response = await fetch(`${this.baseUrl}/export`);
        return response.json();
    }

    async getNodes(): Promise<Node[]> {
        const response = await fetch(`${this.baseUrl}/nodes`);
        return response.json();
    }

    async createUnnamedNode(type: string): Promise<Node> {
        const response = await fetch(`${this.baseUrl}/nodes?type=${encodeURIComponent(type)}`, {
            method: 'POST',
        });
        return response.json();
    }

    async getNodeByName(nodeName: string): Promise<Node> {
        const response = await fetch(`${this.baseUrl}/nodes/${encodeURIComponent(nodeName)}`);
        return response.json();
    }

    async createNode(nodeName: string, type: string): Promise<Node> {
        const response = await fetch(
            `${this.baseUrl}/nodes/${encodeURIComponent(nodeName)}?type=${encodeURIComponent(type)}`,
            {
                method: 'POST',
            }
        );
        return response.json();
    }

    async removeNode(nodeName: string): Promise<Node> {
        const response = await fetch(`${this.baseUrl}/nodes/${encodeURIComponent(nodeName)}`, {
            method: 'DELETE',
        });
        return response.json();
    }

    async getConnections(): Promise<Connection[]> {
        const response = await fetch(`${this.baseUrl}/connections`);
        return response.json();
    }

    async addConnection(connection: Connection): Promise<Connection> {
        const response = await fetch(`${this.baseUrl}/connections`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(connection),
        });
        return response.json();
    }

    async removeConnection(connection: Connection): Promise<Connection | null> {
        const response = await fetch(`${this.baseUrl}/connections`, {
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
