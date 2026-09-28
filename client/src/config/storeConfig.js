// Tudo que muda de cliente para cliente vive aqui. Nenhum componente deve
// carregar número de frete, contato ou flag de campanha hardcoded.
export const storeConfig = {
  brand: {
    name: 'Campo Cheio',
    // O logo renderiza as duas partes com ênfases diferentes
    nameParts: ['CAMPO', 'CHEIO'],
  },

  contact: {
    // Placeholder herdado do código atual — trocar antes de ir para produção
    whatsapp: '5511999999999',
  },

  shipping: {
    freeThreshold: 149,
    standardCost: 15,
  },

  // Banner de campanha. Desligado por padrão: urgência falsa só queima confiança.
  promo: {
    enabled: false,
    tag: '',
    title: '',
    subtitle: '',
    endsAt: null,
  },

  leadCapture: {
    enabled: true,
    discount: '10% OFF',
  },

  social: {
    // null = não exibir números que não temos. Preencher só com dado real.
    stats: null,
    seedTestimonials: true,
  },
};

export default storeConfig;
