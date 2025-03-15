import { it, expect, describe } from 'vitest';
import { ContainerItem } from 'src/domain/model/item/container-item';

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
