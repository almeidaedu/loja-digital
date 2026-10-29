const { getSettings, updateSettings } = require('../services/settings');

// Monta o objeto salvo campo a campo a partir do corpo já validado e saneado
// (settingsRoutes). Chave que não está aqui não chega ao banco.
function toSettings({ brand, contact, shipping, promo, leadCapture, social }) {
  return {
    brand: { name: brand.name, nameParts: brand.nameParts },
    contact: { whatsapp: contact.whatsapp },
    shipping: { freeThreshold: shipping.freeThreshold, standardCost: shipping.standardCost },
    promo: {
      enabled: promo.enabled,
      tag: promo.tag,
      title: promo.title,
      subtitle: promo.subtitle,
      endsAt: promo.endsAt ?? null,
    },
    leadCapture: { enabled: leadCapture.enabled, discount: leadCapture.discount },
    social: {
      stats: social.stats ? { rating: social.stats.rating, reviews: social.stats.reviews } : null,
      seedTestimonials: social.seedTestimonials,
    },
  };
}

async function show(_req, res, next) {
  try {
    res.json({ settings: await getSettings() });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    res.json({ settings: await updateSettings(toSettings(req.body)) });
  } catch (err) {
    next(err);
  }
}

module.exports = { show, update };
