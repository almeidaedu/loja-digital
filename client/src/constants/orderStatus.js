// Fonte única de label e cor de status de pedido. A API devolve a string crua;
// quem renderiza pergunta aqui, não monta o próprio mapa.
export const ORDER_STATUS = {
  pending:          { label: 'Pendente',          tone: 'yellow' },
  waiting_payment:  { label: 'Aguardando pagamento', tone: 'yellow' },
  in_process:       { label: 'Em análise',        tone: 'yellow' },
  approved:         { label: 'Pagamento aprovado', tone: 'green' },
  shipped:          { label: 'Enviado',           tone: 'blue' },
  delivered:        { label: 'Entregue',          tone: 'green' },
  rejected:         { label: 'Recusado',          tone: 'red' },
  cancelled:        { label: 'Cancelado',         tone: 'red' },
};

// Status desconhecido aparece cru em cinza — melhor que sumir da tela.
export function getOrderStatus(status) {
  return ORDER_STATUS[status] ?? { label: status ?? '—', tone: 'gray' };
}
