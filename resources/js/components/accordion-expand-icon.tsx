import { PlusIcon, type LucideIcon } from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export interface AccordionExpandIconItem {
    icon: LucideIcon;
    title: string;
    content: string;
}

interface AccordionExpandIconProps {
    items: AccordionExpandIconItem[];
    defaultValue?: string;
    className?: string;
}

export function AccordionExpandIcon({
    items,
    defaultValue = 'item-1',
    className,
}: AccordionExpandIconProps) {
    return (
        <Accordion
            type="single"
            collapsible
            className={cn('w-full', className)}
            defaultValue={defaultValue}
        >
            {items.map((item, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                    <AccordionPrimitive.Header className="flex">
                        <AccordionPrimitive.Trigger
                            data-slot="accordion-trigger"
                            className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-45"
                        >
                            <span className="flex items-center gap-4">
                                <item.icon className="size-4 shrink-0" />
                                <span>{item.title}</span>
                            </span>
                            <PlusIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionContent className="text-muted-foreground">
                        {item.content}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
