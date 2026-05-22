import { Fragment } from 'react';
import {
  BoltIcon,
  LockIcon,
  TrophyIcon,
  SyncIcon,
  CreditCardIcon,
} from '../../../components/ui/Icons';
import './TrustBar.css';

const ITEMS = [
  { Icon: BoltIcon,       text: 'Entrega em 24h' },
  { Icon: LockIcon,       text: 'Pagamento Seguro' },
  { Icon: TrophyIcon,     text: 'Produto Original' },
  { Icon: SyncIcon,       text: 'Troca Grátis' },
  { Icon: CreditCardIcon, text: 'Parcelamento em 12x' },
];

export default function TrustBar() {
  return (
    <div className="trust-bar">
      <div className="container">
        <ul className="trust-items">
          {ITEMS.map((item, i) => (
            <Fragment key={item.text}>
              <li className="trust-item">
                <span className="trust-icon">
                  <item.Icon sx={{ fontSize: '18px' }} />
                </span>
                <span className="trust-text">{item.text}</span>
              </li>
              {i < ITEMS.length - 1 && (
                <li className="trust-sep" aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
