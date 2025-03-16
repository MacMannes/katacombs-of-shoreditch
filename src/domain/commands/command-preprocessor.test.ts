import { describe, expect, test } from 'vitest';
import { CommandPreprocessor } from 'src/domain/commands/command-preprocessor.ts';

describe('CommandPreprocessor', () => {
    const preprocessor = new CommandPreprocessor();

    test.each([
        ['look north', 'look north'],
        ['print invoice', 'print invoice'],
        ['e', 'go east'],
        ['east', 'go east'],
        ['go e', 'go east'],
        ['w', 'go west'],
        ['west', 'go west'],
        ['go w', 'go west'],
        ['n', 'go north'],
        ['north', 'go north'],
        ['s', 'go south'],
        ['south', 'go south'],
        ['go s', 'go south'],
        ['d', 'go down'],
        ['go d', 'go down'],
        ['down', 'go down'],
        ['u', 'go up'],
        ['up', 'go up'],
        ['go u', 'go up'],
        ['Take Lamp', 'take lamp'],
        ['   Go  N  ', 'go north'],
        ['   Say  Hello  ', 'say hello'],
        ['bag', 'inventory'],
        ['i', 'inventory'],
    ])(
        `Processing input "%s" should return "%s"`,
        (input: string, expected: string) => {
            const result = preprocessor.process(input);

            expect(result).toBe(expected);
        },
    );
});
