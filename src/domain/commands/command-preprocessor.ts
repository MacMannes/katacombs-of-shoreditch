export class CommandPreprocessor {
    public process(input: string): string {
        const sanitizedInput = this.sanitize(input);
        switch (sanitizedInput) {
            case 'e':
            case 'east':
            case 'go e':
                return 'go east';
            case 'w':
            case 'west':
            case 'go w':
                return 'go west';
            case 'n':
            case 'north':
            case 'go n':
                return 'go north';
            case 's':
            case 'south':
            case 'go s':
                return 'go south';
            case 'd':
            case 'down':
            case 'go d':
                return 'go down';
            case 'u':
            case 'up':
            case 'go u':
                return 'go up';
            case 'bag':
            case 'i':
                return 'inventory';
            default:
                return sanitizedInput;
        }
    }

    private sanitize(input: string): string {
        return input
            .toLowerCase()
            .split(' ')
            .filter((it) => it.length > 0)
            .map((it) => it.trim())
            .join(' ');
    }
}
