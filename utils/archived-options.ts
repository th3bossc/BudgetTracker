export interface ArchivableOption {
    id: string;
    name: string;
    isArchived?: boolean;
}

/** Active choices plus the value already saved on the record being edited. */
export const getSelectableOptions = <T extends ArchivableOption>(
    items: T[],
    selectedId?: string,
) => items
    .filter(item => !item.isArchived || item.id === selectedId)
    .map(item => ({
        label: item.isArchived ? `${item.name} (archived)` : item.name,
        value: item.id,
    }));
