import { StarFilledIcon, StarHalfIcon, StarEmptyIcon } from '../Icons';
import './Rating.css';

const ratingFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Nota de 0 a 5 em estrelas, com meia estrela. Antes cada tela desenhava as
// suas, com `#FFD700` e `rgba` cravados e um `aria-label` em <div>/<span> sem
// papel, que leitor de tela ignora. Aqui é uma imagem só, com nome ("4,5 de 5
// estrelas"), e as estrelas são decoração dela.
export default function Rating({ value, size = '16px', className = '' }) {
  const rating = Math.min(5, Math.max(0, Number(value) || 0));
  // Arredonda para a meia estrela mais próxima: 4,3 → 4,5; 4,2 → 4.
  const halves = Math.round(rating * 2);

  return (
    <span
      className={`rating${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={`${ratingFormat.format(rating)} de 5 estrelas`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = halves - i * 2;
        if (filled >= 2) return <StarFilledIcon key={i} sx={{ fontSize: size }} />;
        if (filled === 1) return <StarHalfIcon key={i} sx={{ fontSize: size }} />;
        return <StarEmptyIcon key={i} className="rating-star--empty" sx={{ fontSize: size }} />;
      })}
    </span>
  );
}
