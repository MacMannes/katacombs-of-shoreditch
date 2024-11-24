export type ItemData = {
    name: string;
    description: {
        room?: string;
        look?: string;
        inventory?: string;
    };
    words?: string[];
    visible?: boolean;
};
