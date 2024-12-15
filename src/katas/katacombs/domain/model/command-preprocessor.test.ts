import { describe, expect, test } from 'vitest';
import { CommandPreprocessor } from '@katas/katacombs/domain';

describe('CommandPreprocessor', () => {
    const preprocessor = new CommandPreprocessor();

    test.each([
        ['look north', 'look north'],
        ['print invoice', 'print invoice'],
        ['e', 'go east'],
        ['go e', 'go east'],
        ['w', 'go west'],
        ['go w', 'go west'],
        ['n', 'go north'],
        ['s', 'go south'],
        ['go s', 'go south'],
        ['d', 'go down'],
        ['u', 'go up'],
        ['go u', 'go up'],
        ['Take Lamp', 'take lamp'],
    ])(`Processing input "%s" should return "%s"`, (input: string, expected: string) => {
        const result = preprocessor.process(input);

        expect(result).toBe(expected);
    });
});
