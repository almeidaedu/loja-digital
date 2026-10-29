import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { spring, tween } from '../../../styles/motion';
import Reveal from '../../ui/Reveal/Reveal';
import { PlusIcon } from '../../ui/Icons';
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
  const reduced = useReducedMotion();
  const baseId = useId();

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section id="faq" className="section faq-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Perguntas Frequentes</h2>
          <p className="section-subtitle">Tudo que você precisa saber antes de comprar</p>
        </div>

        <Reveal className="faq-list">
          {ITEMS.map((item, i) => {
            const open = openIndex === i;
            const questionId = `${baseId}-q${i}`;
            const answerId = `${baseId}-a${i}`;

            return (
              <div key={item.q} className={`faq-item${open ? ' faq-item--open' : ''}`}>
                <h3>
                  <button
                    id={questionId}
                    type="button"
                    className="faq-question"
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => toggle(i)}
                  >
                    {item.q}
                    <motion.span
                      className="faq-icon"
                      aria-hidden="true"
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={reduced ? tween.fast : spring.snappy}
                    >
                      <PlusIcon sx={{ fontSize: '18px' }} />
                    </motion.span>
                  </button>
                </h3>

                {/* Exceção à regra de só animar transform/opacity, como a barra do
                    FreteBar: acordeão é altura por natureza. Era `max-height: 300px`
                    em CSS, que cortava resposta longa e levava o mesmo tempo para
                    abrir uma linha ou dez. O motion mede o `auto` de verdade. */}
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reduced ? tween.fast : spring.snappy}
                    >
                      <p className="faq-answer-text">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
