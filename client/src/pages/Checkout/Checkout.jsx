import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatCurrency';
import { LockIcon, BoltIcon } from '../../components/ui/Icons';
import './Checkout.css';

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'GGG'];
const SHIPPING_THRESHOLD = 149;
const SHIPPING_COST = 15;

const INITIAL_ADDRESS = {
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);

  const subtotal = items.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity,
    0
  );
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const [step, setStep] = useState('address');
  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [addressError, setAddressError] = useState('');
  const [paymentTab, setPaymentTab] = useState('card');
  const [pixForm, setPixForm] = useState({ cpf: '', payerEmail: '' });
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState('');

  function handleAddressChange(e) {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setAddressError('');
  }

  function handleAddressSubmit(e) {
    e.preventDefault();
    const required = ['cep', 'street', 'number', 'neighborhood', 'city', 'state'];
    for (const field of required) {
      if (!address[field].trim()) {
        setAddressError('Preencha todos os campos obrigatórios.');
        return;
      }
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCheckoutPro() {
    setLoading(true);
    setPayError('');
    try {
      const { order } = await orderService.createOrder({ shippingAddress: address });
      const prefData = await paymentService.createPreference(order.id);
      const initPoint =
        import.meta.env.MODE === 'development'
          ? prefData.sandboxInitPoint
          : prefData.initPoint;
      window.location.href = initPoint;
    } catch {
      setPayError('Não foi possível iniciar o pagamento. Tente novamente ou escolha outra forma de pagamento.');
      setLoading(false);
    }
  }

  async function handlePixPayment(e) {
    e.preventDefault();
    if (!pixForm.cpf || !pixForm.payerEmail) {
      setPayError('Preencha CPF e e-mail para gerar o Pix.');
      return;
    }
    setLoading(true);
    setPayError('');
    try {
      const { order } = await orderService.createOrder({ shippingAddress: address });
      const pixData = await paymentService.createPix({
        orderId: order.id,
        payerCPF: pixForm.cpf,
        payerEmail: pixForm.payerEmail,
      });
      navigate('/pagamento/pendente', { state: { pixData } });
    } catch {
      setPayError('Não foi possível gerar o QR Code Pix. Tente novamente ou escolha outra forma de pagamento.');
      setLoading(false);
    }
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">CHECKOUT</h1>
        <div className="checkout-grid">
          <div>
            {step === 'address' && (
              <div className="checkout-box">
                <h2 className="checkout-section-heading">Endereço de entrega</h2>
                <form onSubmit={handleAddressSubmit} noValidate>
                  <div className="checkout-form-grid">
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                      <label className="form-label">CEP *</label>
                      <input
                        name="cep"
                        className="form-input"
                        placeholder="00000-000"
                        value={address.cep}
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Rua / Logradouro *</label>
                      <input
                        name="street"
                        className="form-input"
                        placeholder="Nome da rua"
                        value={address.street}
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Número *</label>
                      <input
                        name="number"
                        className="form-input"
                        placeholder="123"
                        value={address.number}
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Complemento</label>
                      <input
                        name="complement"
                        className="form-input"
                        placeholder="Apto, bloco, etc."
                        value={address.complement}
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Bairro *</label>
                      <input
                        name="neighborhood"
                        className="form-input"
                        placeholder="Nome do bairro"
                        value={address.neighborhood}
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Cidade *</label>
                      <input
                        name="city"
                        className="form-input"
                        placeholder="Sua cidade"
                        value={address.city}
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Estado *</label>
                      <select
                        name="state"
                        className="form-input"
                        value={address.state}
                        onChange={handleAddressChange}
                      >
                        <option value="">UF</option>
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
                          'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
                          'SP','SE','TO'].map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {addressError && <p className="form-error" style={{ marginTop: 12 }}>{addressError}</p>}

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '24px', padding: '14px' }}
                  >
                    CONTINUAR
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="checkout-box">
                <button
                  className="checkout-back-btn"
                  onClick={() => setStep('address')}
                >
                  ← Voltar ao endereço
                </button>
                <h2 className="checkout-section-heading">Forma de pagamento</h2>

                <div className="payment-tabs">
                  <button
                    className={`payment-tab${paymentTab === 'card' ? ' active' : ''}`}
                    onClick={() => setPaymentTab('card')}
                  >
                    Cartão / Boleto
                  </button>
                  <button
                    className={`payment-tab${paymentTab === 'pix' ? ' active' : ''}`}
                    onClick={() => setPaymentTab('pix')}
                  >
                    Pix
                  </button>
                </div>

                {paymentTab === 'card' && (
                  <div>
                    <p className="checkout-pay-desc">
                      Você será redirecionado para o ambiente seguro do Mercado Pago para
                      finalizar o pagamento com cartão de crédito, débito ou boleto.
                    </p>
                    {payError && <p className="form-error" style={{ marginBottom: 16 }}>{payError}</p>}
                    <button
                      className="btn-primary"
                      onClick={handleCheckoutPro}
                      disabled={loading}
                      style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                    >
                      {loading ? <span className="spinner" /> : <><LockIcon sx={{ fontSize: '16px' }} /> PAGAR COM MERCADO PAGO</>}
                    </button>
                  </div>
                )}

                {paymentTab === 'pix' && (
                  <form onSubmit={handlePixPayment} noValidate>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">CPF do pagador *</label>
                      <input
                        className="form-input"
                        placeholder="000.000.000-00"
                        value={pixForm.cpf}
                        onChange={(e) =>
                          setPixForm((p) => ({ ...p, cpf: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="form-label">E-mail do pagador *</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="seu@email.com"
                        value={pixForm.payerEmail}
                        onChange={(e) =>
                          setPixForm((p) => ({ ...p, payerEmail: e.target.value }))
                        }
                      />
                    </div>
                    {payError && <p className="form-error" style={{ marginBottom: 16 }}>{payError}</p>}
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                      style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                    >
                      {loading ? <span className="spinner" /> : <><BoltIcon sx={{ fontSize: '16px' }} /> GERAR QR CODE PIX</>}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: order summary */}
          <aside>
            <div className="order-summary-card">
              <h3 className="checkout-section-heading" style={{ marginBottom: 16 }}>
                Resumo do pedido
              </h3>

              <div className="order-items-list">
                {items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <span className="order-item-name">
                      {item.name}
                      <span className="order-item-qty"> × {item.quantity}</span>
                      {item.size && (
                        <span className="order-item-size"> [{item.size}]</span>
                      )}
                    </span>
                    <span>{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <div className="order-summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="order-summary-row">
                  <span>Frete</span>
                  <span>
                    {shipping === 0 ? (
                      <span style={{ color: 'var(--accent-green)' }}>GRÁTIS</span>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="order-free-shipping-hint">
                    Falta {formatCurrency(SHIPPING_THRESHOLD - subtotal)} para frete grátis
                  </p>
                )}
              </div>

              <div className="order-total-row">
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
