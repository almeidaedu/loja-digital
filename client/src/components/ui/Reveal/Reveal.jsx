import { motion, useReducedMotion } from 'motion/react';
import { rise, spring, withReducedMotion } from '../../../styles/motion';

// Entrada por scroll. Usa whileInView do motion em vez de IntersectionObserver
// manual — o observer manual quebra quando os dados chegam depois da montagem.
export default function Reveal({
  as = 'div',
  delay = 0,
  amount = 0.2,
  once = true,
  className = '',
  children,
  ...rest
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      variants={withReducedMotion(rise, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ ...spring.gentle, delay: reduced ? 0 : delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}
