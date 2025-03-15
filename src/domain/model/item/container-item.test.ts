import { ContainerItem } from 'src/domain';
import { it, expect, describe } from 'vitest';

describe('Container Items', () => {
    it('should close when closed', () => {
        const container = new ContainerItem('drawer', {
            description: { room: '', inventory: '', look: 'drawer' },
            open: false,
        });

        container.close();

        expect(container.isOpen()).toBeFalsy();
    });
});
