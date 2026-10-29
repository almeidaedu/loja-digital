import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useUiStore } from '../../../store/uiStore';
import Field from '../../../components/ui/Field/Field';
import Switch from '../../../components/ui/Switch/Switch';
import Button from '../../../components/ui/Button/Button';
import './AdminSettings.css';

const pad = (n) => String(n).padStart(2, '0');

// `datetime-local` não tem fuso: trabalha na hora do navegador. A API guarda ISO.
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null);

// Número vazio vai como null: o servidor recusa com a mensagem do campo, que é
// melhor que um 0 silencioso.
const toNumber = (value) => (value === '' ? null : Number(value));

// Formulário trabalha com texto nos inputs; a API, com números, booleanos e ISO.
function toForm(s) {
  return {
    brandName: s.brand.name,
    logoPrefix: s.brand.nameParts[0],
    logoSuffix: s.brand.nameParts[1],
    whatsapp: s.contact.whatsapp,
    freeThreshold: String(s.shipping.freeThreshold),
    standardCost: String(s.shipping.standardCost),
    promoEnabled: s.promo.enabled,
    promoTag: s.promo.tag,
    promoTitle: s.promo.title,
    promoSubtitle: s.promo.subtitle,
    promoEndsAt: toLocalInput(s.promo.endsAt),
    leadEnabled: s.leadCapture.enabled,
    discount: s.leadCapture.discount,
    statsEnabled: s.social.stats !== null,
    rating: s.social.stats ? String(s.social.stats.rating) : '',
    reviews: s.social.stats ? String(s.social.stats.reviews) : '',
    seedTestimonials: s.social.seedTestimonials,
  };
}

function toPayload(f) {
  return {
    brand: { name: f.brandName, nameParts: [f.logoPrefix, f.logoSuffix] },
    contact: { whatsapp: f.whatsapp },
    shipping: { freeThreshold: toNumber(f.freeThreshold), standardCost: toNumber(f.standardCost) },
    promo: {
      enabled: f.promoEnabled,
      tag: f.promoTag,
      title: f.promoTitle,
      subtitle: f.promoSubtitle,
      endsAt: fromLocalInput(f.promoEndsAt),
    },
    leadCapture: { enabled: f.leadEnabled, discount: f.discount },
    social: {
      stats: f.statsEnabled ? { rating: toNumber(f.rating), reviews: toNumber(f.reviews) } : null,
      seedTestimonials: f.seedTestimonials,
    },
  };
}

// Caminho do erro no 422 (`field`) → campo do formulário, para marcar e focar.
const FIELD_BY_PATH = {
  'brand.name': 'brandName',
  'brand.nameParts': 'logoPrefix',
  'brand.nameParts[0]': 'logoPrefix',
  'brand.nameParts[1]': 'logoSuffix',
  'contact.whatsapp': 'whatsapp',
  'shipping.freeThreshold': 'freeThreshold',
  'shipping.standardCost': 'standardCost',
  'promo.tag': 'promoTag',
  'promo.title': 'promoTitle',
  'promo.subtitle': 'promoSubtitle',
  'promo.endsAt': 'promoEndsAt',
  'leadCapture.discount': 'discount',
  'social.stats.rating': 'rating',
  'social.stats.reviews': 'reviews',
};

const fieldId = (name) => `settings-${name}`;

export default function AdminSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const save = useSettingsStore((s) => s.save);
  const addToast = useUiStore((s) => s.addToast);

  const [form, setForm] = useState(() => toForm(settings));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // As duas pontas passam pela mesma conversão: abrir a página e não mexer em
  // nada não pode contar como alteração.
  const dirty = JSON.stringify(toPayload(form)) !== JSON.stringify(toPayload(toForm(settings)));

  // Fechar a aba com alteração não salva. Navegação interna não é coberta: o
  // BrowserRouter não é data router, e o `useBlocker` só existe nele.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const set = (name) => (value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };
  const input = (name) => ({
    id: fieldId(name),
    value: form[name],
    onChange: (event) => set(name)(event.target.value),
    error: errors[name],
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await save(toPayload(form));
      setForm(toForm(saved));
      setErrors({});
      addToast({ type: 'success', message: 'Configurações salvas. A loja já está usando os novos valores.' });
    } catch (err) {
      const { message, field } = err.response?.data ?? {};
      const name = FIELD_BY_PATH[field];
      if (name) {
        setErrors({ [name]: message });
        document.getElementById(fieldId(name))?.focus();
      }
      addToast({ type: 'error', message: message || 'Não foi possível salvar. Tente de novo.' });
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setForm(toForm(settings));
    setErrors({});
  };

  const endsAtPassed = form.promoEndsAt && new Date(form.promoEndsAt).getTime() <= Date.now();

  return (
    <form className="settings" onSubmit={handleSubmit} noValidate>
      <header className="settings-header">
        <h2 className="settings-title">Configurações da loja</h2>
        <p className="settings-subtitle">
          O que você salvar aqui vale na hora para quem está na loja.
        </p>
      </header>

      <section className="settings-card" aria-labelledby="settings-brand">
        <h3 id="settings-brand" className="settings-card-title">Marca e contato</h3>
        <Field
          label="Nome da loja"
          hint="Aparece no título da aba, no rodapé e na fatura do cartão."
          {...input('brandName')}
        />
        <div className="settings-row">
          <Field label="Logo — primeira parte" {...input('logoPrefix')} />
          <Field label="Logo — parte em destaque" {...input('logoSuffix')} />
        </div>
        <p className="settings-logo-preview">
          <span className="settings-preview-label">Prévia</span>
          <span className="settings-logo">
            {form.logoPrefix} <span>{form.logoSuffix}</span>
          </span>
        </p>
        <Field
          label="WhatsApp"
          inputMode="numeric"
          hint="Só números, com DDI e DDD. Ex.: 5511999999999."
          {...input('whatsapp')}
        />
      </section>

      <section className="settings-card" aria-labelledby="settings-shipping">
        <h3 id="settings-shipping" className="settings-card-title">Frete</h3>
        <div className="settings-row">
          <Field
            label="Frete grátis a partir de (R$)"
            type="number"
            min="0"
            step="0.01"
            hint="0 deixa o frete sempre grátis."
            {...input('freeThreshold')}
          />
          <Field
            label="Valor do frete (R$)"
            type="number"
            min="0"
            step="0.01"
            hint="Cobrado abaixo do limite."
            {...input('standardCost')}
          />
        </div>
      </section>

      <section className="settings-card" aria-labelledby="settings-promo">
        <h3 id="settings-promo" className="settings-card-title">Promoção</h3>
        <Switch
          label="Banner de promoção na Home"
          hint="Desligado, o banner não aparece."
          checked={form.promoEnabled}
          onChange={set('promoEnabled')}
        />
        <div className="settings-row">
          <Field label="Etiqueta" {...input('promoTag')} />
          <Field label="Título" required={form.promoEnabled} {...input('promoTitle')} />
        </div>
        <Field label="Subtítulo" {...input('promoSubtitle')} />
        <Field
          label="Termina em"
          type="datetime-local"
          hint={
            endsAtPassed
              ? 'Essa data já passou: o banner não vai aparecer.'
              : 'Com data, o banner mostra um contador e some sozinho no fim. Sem data, não tem prazo.'
          }
          {...input('promoEndsAt')}
        />
      </section>

      <section className="settings-card" aria-labelledby="settings-lead">
        <h3 id="settings-lead" className="settings-card-title">Popup de saída</h3>
        <Switch
          label="Oferecer cupom quando o visitante for sair"
          hint="Aparece uma vez por sessão do navegador."
          checked={form.leadEnabled}
          onChange={set('leadEnabled')}
        />
        <Field
          label="Desconto"
          hint={`Vai no título e no botão: "Espera! ${form.discount}".`}
          {...input('discount')}
        />
      </section>

      <section className="settings-card" aria-labelledby="settings-social">
        <h3 id="settings-social" className="settings-card-title">Prova social</h3>
        <Switch
          label="Depoimentos de exemplo"
          hint="Desligado, a seção some da Home e o link Avaliações fica desabilitado."
          checked={form.seedTestimonials}
          onChange={set('seedTestimonials')}
        />
        <Switch
          label="Mostrar nota média e total de avaliações"
          hint="Só com números reais. Aparece no topo da Home e nos depoimentos."
          checked={form.statsEnabled}
          onChange={set('statsEnabled')}
        />
        {form.statsEnabled && (
          <div className="settings-row">
            <Field
              label="Nota média (0 a 5)"
              type="number"
              min="0"
              max="5"
              step="0.1"
              {...input('rating')}
            />
            <Field label="Total de avaliações" type="number" min="0" step="1" {...input('reviews')} />
          </div>
        )}
      </section>

      <div className="settings-actions">
        <span className="settings-status" role="status">
          {dirty ? 'Alterações não salvas' : 'Tudo salvo'}
        </span>
        <Button variant="ghost" onClick={discard} disabled={!dirty || saving}>
          Descartar
        </Button>
        <Button type="submit" loading={saving} disabled={!dirty}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
