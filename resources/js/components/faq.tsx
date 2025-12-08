import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

type FAQs = {
    question: string;
    answer: string;
}[];

type FAQProps = {
    faqItems: FAQs;
    title?: string;
    description?: string;
};

const FAQ = ({
    faqItems,
    title = "Need Help? We've Got Answers",
    description = 'Explore Our Most Commonly Asked Questions and Find the Information You Need.',
}: FAQProps) => {
    return (
        <section id="faq" className="py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* FAQ Header */}
                <div className="mb-8 space-y-4 text-center sm:mb-12">
                    <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
                        {title}
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        {description}
                    </p>
                </div>

                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="item-1"
                >
                    {faqItems.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index + 1}`}>
                            <AccordionTrigger className="text-lg">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQ;
