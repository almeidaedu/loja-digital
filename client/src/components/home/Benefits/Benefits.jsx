import {
  LocalShippingIcon,
  LockIcon,
  SyncIcon,
  TrophyIcon,
} from '../../../components/ui/Icons';
import './Benefits.css';

const BENEFITS = [
  {
    Icon: LocalShippingIcon,
    title: 'Entrega Expressa',
    desc: 'Pedidos feitos até 18h são despachados no mesmo dia. Receba em casa em até 24h nas principais capitais.',
  },
  {
    Icon: LockIcon,
    title: 'Pagamento 100% Seguro',
    desc: 'Ambiente criptografado SSL. Aceitamos cartão, Pix e boleto. Seus dados nunca são compartilhados.',
  },
  {
    Icon: SyncIcon,
    title: 'Troca Sem Burocracia',
    desc: 'Não ficou bom? Troque grátis em até 30 dias. Sem perguntas, sem complicação. Cliente satisfeito sempre.',
  },
  {
    Icon: TrophyIcon,
    title: 'Produto Original',
    desc: 'Todas as camisas possuem certificação oficial, tag original e nota fiscal. 100% autenticidade garantida.',
  },
];

export default function Benefits() {
  return (
    <section className="benefits-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Por Que Comprar Aqui?</h2>
          <p className="section-subtitle">Garantias que você não encontra em qualquer loja</p>
        </div>
        <div className="benefits-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="benefit-card animate-on-scroll">
              <div className="benefit-icon">
                <b.Icon sx={{ fontSize: '36px' }} />
              </div>
              <h3 className="benefit-title">{b.title}</h3>
              <p className="benefit-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
