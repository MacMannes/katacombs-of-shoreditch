export class CommandPreprocessor {
    public process(input: string): string {
        switch (input) {
            case 'e':
                return 'go east';
            case 'w':
                return 'go west';
            case 'n':
                return 'go north';
            case 's':
                return 'go south';
            case 'd':
                return 'go down';
            case 'u':
                return 'go up';
            default:
                return input;
        }
    }
}
