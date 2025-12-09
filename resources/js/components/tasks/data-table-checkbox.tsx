import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/types/task';
import { Row } from '@tanstack/react-table';

interface DataTableCheckboxProps {
    row: Row<Task>;
}

export function DataTableCheckbox({ row }: DataTableCheckboxProps) {
    return (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
                row.toggleSelected(!!value);
            }}
            aria-label="Select row"
            className="translate-y-[2px]"
        />
    );
}
