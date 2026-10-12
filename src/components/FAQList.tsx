import { faqs } from '../data/event';

export default function FAQList() {
  return <div className="faq-list">{faqs.map(([question, answer], index) => <details key={question}>
    <summary><span className="micro-label">{String(index + 1).padStart(2, '0')}</span>{question}<span className="faq-plus" aria-hidden="true">+</span></summary>
    <p>{answer}</p>
  </details>)}</div>;
}
