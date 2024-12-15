export class CommandPreprocessor {
    public process(input: string): string {
        const sanitizedInput = this.sanitize(input);
        switch (sanitizedInput) {
            case 'e':
            case 'go e':
                return 'go east';
            case 'w':
            case 'go w':
                return 'go west';
            case 'n':
            case 'go n':
                return 'go north';
            case 's':
            case 'go s':
                return 'go south';
            case 'd':
            case 'go d':
                return 'go down';
            case 'u':
            case 'go u':
                return 'go up';
            default:
                return sanitizedInput;
        }
    }

    private sanitize(input: string): string {
        return input.toLowerCase();
    }
}
