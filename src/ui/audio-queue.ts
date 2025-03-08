/* v8 ignore start */

export class AudioQueue {
    private queue: string[] = [];

    public add(...files: string[]): void {
        this.queue.push(...files);
    }

    public next(): string | undefined {
        return this.queue.shift();
    }

    public clear(): void {
        this.queue = [];
    }

    public isEmpty(): boolean {
        return this.queue.length === 0;
    }
}

/* v8 ignore end */
