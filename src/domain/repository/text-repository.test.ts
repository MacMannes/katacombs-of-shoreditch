import { describe, expect, it } from 'vitest';
import { TextRepository } from 'src/domain';

describe('TextRepository', () => {
    describe('getText', () => {
        it('should return undefined when key was not found', () => {
            const repository = new TextRepository({});

            const text = repository.getText('key');
            expect(text).toBeUndefined();
        });

        it('should return the text when key was found', () => {
            const repository = new TextRepository({ hello: 'world' });

            const text = repository.getText('hello');
            expect(text).toBe('world');
        });
    });
});
