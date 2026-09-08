'use client';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '@/components/ui/accordion';
export default function FAQ({items}:{items:{question:string;answer:string}[]}){return <Accordion className="faq-list">{items.map((item,i)=><AccordionItem key={item.question} value={String(i)}><AccordionTrigger className="faq-question">{item.question}</AccordionTrigger><AccordionContent className="faq-answer"><p>{item.answer}</p></AccordionContent></AccordionItem>)}</Accordion>}
