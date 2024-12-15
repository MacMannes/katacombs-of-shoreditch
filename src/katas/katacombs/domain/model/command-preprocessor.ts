export class CommandPreprocessor {
    public process(input: string): string {
        switch (input) {
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
                return input;
        }
    }
}
