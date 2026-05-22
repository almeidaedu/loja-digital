import { useState } from 'react';
import './FAQ.css';

const ITEMS = [
  {
    q: 'Qual é o prazo de entrega?',
    a: 'Pedidos feitos até 18h são despachados no mesmo dia útil. O prazo de entrega varia de 1 a 5 dias úteis dependendo da sua região. Capitais e grandes centros costumam receber em até 24h.',
  },
  {
    q: 'Os produtos são originais?',
    a: 'Sim, 100%. Trabalhamos apenas com produtos oficiais licenciados, com etiqueta original e nota fiscal. Cada peça passa por verificação antes de ser enviada.',
  },
  {
    q: 'Posso trocar se o tamanho não servir?',
    a: 'Sim! Oferecemos troca grátis em até 30 dias após a entrega. Basta entrar em contato pelo nosso WhatsApp ou e-mail, sem burocracia e sem custo para você.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Aceitamos cartão de crédito (até 12x sem juros), cartão de débito, Pix (5% de desconto) e boleto bancário. Todas as transações são criptografadas e seguras.',
  },
  {
    q: 'Vocês têm camisas do tamanho infantil ao GG?',
    a: 'Sim! Nossa grade vai do tamanho infantil (4 anos) até o G4 adulto. Consulte a tabela de medidas na página do produto para garantir o tamanho certo.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="faq-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Perguntas Frequentes</h2>
          <p className="section-subtitle">Tudo que você precisa saber antes de comprar</p>
        </div>
        <div className="faq-list">
          {ITEMS.map((item, i) => (
            <div key={i} className={`faq-item${openIndex === i ? ' open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                type="button"
              >
                <span>{item.q}</span>
                <span className="faq-icon" aria-hidden="true">+</span>
              </button>
              <div className="faq-answer" aria-hidden={openIndex !== i}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
