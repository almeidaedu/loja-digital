import { motion, useReducedMotion } from 'motion/react';
import { storeConfig } from '../../../config/storeConfig';
import { formatCurrency } from '../../../utils/formatCurrency';
import { popIn, rise, spring, withReducedMotion } from '../../../styles/motion';
import Button from '../../ui/Button/Button';
import {
  BoltIcon,
  LocalShippingIcon,
  LockIcon,
  SoccerBallIcon,
  StarFilledIcon,
} from '../../ui/Icons';
import './Hero.css';

const ratingFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const countFormat = new Intl.NumberFormat('pt-BR');

export default function Hero() {
  const reduced = useReducedMotion();
  const { stats } = storeConfig.social;
  const { freeThreshold } = storeConfig.shipping;

  return (
    <section className="hero">
      <div className="container hero-grid">
        <motion.div
          className="hero-content"
          variants={withReducedMotion(rise, reduced)}
          initial="hidden"
          animate="visible"
          transition={spring.gentle}
        >
          {/* Era "Temporada 2024/25", vencido. Sem ano, não vence de novo. */}
          <p className="hero-eyebrow">Nova temporada</p>
          <h1 className="hero-headline">
            Vista as cores
            <span className="hero-headline-accent">QUE VOCÊ DEFENDE</span>
          </h1>
          <p className="hero-subheadline">
            Camisas oficiais dos maiores clubes do Brasil. Entrega rápida, produto original,
            compra garantida.
          </p>

          <ul className="hero-pills">
            {/* Era "Entrega em 24h" como promessa geral, mas o FAQ diz 1 a 5 dias
                úteis e 24h só "costuma" valer em capitais. O que ele garante para
                todo pedido é o despacho no mesmo dia. */}
            <li className="hero-pill">
              <BoltIcon sx={{ fontSize: '14px' }} /> Envio no mesmo dia
            </li>
            <li className="hero-pill">
              <LocalShippingIcon sx={{ fontSize: '14px' }} /> Frete grátis acima de{' '}
              {formatCurrency(freeThreshold)}
            </li>
            <li className="hero-pill">
              <LockIcon sx={{ fontSize: '14px' }} /> Compra segura
            </li>
          </ul>

          <Button href="#produtos" size="lg">
            Ver Coleção Agora
          </Button>

          {/* Saíram "+12.000 pedidos entregues" com quatro avatares de letra,
              "4.9 / 5.0" e "+500 vendidos essa semana" — nenhum vinha de dado.
              A nota volta se o lojista declarar `social.stats`. */}
          {stats && (
            <p className="hero-rating">
              <StarFilledIcon className="hero-rating-star" sx={{ fontSize: '16px' }} />
              <strong>{ratingFormat.format(stats.rating)}</strong> de 5 ·{' '}
              {countFormat.format(stats.reviews)} avaliações
            </p>
          )}
        </motion.div>

        {/* Ornamento. Era um <svg> desenhado à mão com "CBF" escrito no peito, e
            duas etiquetas ("Nova temporada", "Mais vendida") sem produto por trás.
            Bola e não camisa: o MUI não tem camisa, e o `ShirtIcon` do projeto é o
            `Checkroom` — um cabide. */}
        <motion.div
          className="hero-visual"
          aria-hidden="true"
          variants={withReducedMotion(popIn, reduced)}
          initial="hidden"
          animate="visible"
          transition={{ ...spring.gentle, delay: reduced ? 0 : 0.1 }}
        >
          <span className="hero-glow" />
          <SoccerBallIcon className="hero-emblem" sx={{ fontSize: 'inherit' }} />
        </motion.div>
      </div>
    </section>
  );
}
