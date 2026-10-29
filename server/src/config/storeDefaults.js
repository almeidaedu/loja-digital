// Valores de fábrica das configurações da loja. É o que vale enquanto o lojista
// não salvar nada no painel, e o que preenche qualquer campo que o template
// ganhar depois do último save (ver `withDefaults` em `services/settings.js`).
//
// Herdeiro do `client/src/config/storeConfig.js`: o formato é o mesmo, e a fonte
// passou a ser o banco.
module.exports = Object.freeze({
  brand: {
    name: 'Campo Cheio',
    // O logo renderiza as duas partes com ênfases diferentes
    nameParts: ['CAMPO', 'CHEIO'],
  },

  contact: {
    // Placeholder — trocar antes de ir para produção. Só dígitos, com DDI e DDD.
    whatsapp: '5511999999999',
  },

  shipping: {
    freeThreshold: 149,
    standardCost: 15,
  },

  // Desligada por padrão: urgência falsa só queima confiança. Com `endsAt` (ISO)
  // o banner mostra contador e some sozinho quando o prazo passa.
  promo: {
    enabled: false,
    tag: 'Oferta Especial',
    title: 'Leve 3, pague 2',
    subtitle: '',
    endsAt: null,
  },

  leadCapture: {
    enabled: true,
    discount: '10% OFF',
  },

  social: {
    // null = não exibir números que não temos. Real: { rating: 4.8, reviews: 1240 }.
    stats: null,
    // Depoimentos de exemplo do template. Desligado, a seção some da Home.
    seedTestimonials: true,
  },
});
