export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  link?: {
    text: string;
    route: string;
  };
}