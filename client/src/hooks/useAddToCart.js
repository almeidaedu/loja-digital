import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';

// Um caminho só para "adicionar ao carrinho". Antes cada página tinha o seu:
// a home checava login, a PDP não checava, e o catálogo não chamava nada.
// Devolve true quando o item entrou e foi confirmado pelo servidor.
export default function useAddToCart() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useUiStore((s) => s.addToast);

  return useCallback(
    async (product, { quantity = 1, size = 'M' } = {}) => {
      if (!isAuthenticated) {
        addToast({ type: 'info', message: 'Entre na sua conta para adicionar itens ao carrinho.' });
        navigate('/login');
        return false;
      }

      try {
        await addItem(product.id, quantity, size);
        addToast({ type: 'success', title: product.name, message: 'Adicionado ao carrinho.' });
        return true;
      } catch (err) {
        // O servidor já diz o porquê ("Estoque insuficiente.", "Produto não
        // encontrado.") — mostrar isso em vez de um genérico.
        addToast({
          type: 'error',
          message: err.response?.data?.message ?? err.message ?? 'Erro ao adicionar ao carrinho.',
        });
        return false;
      }
    },
    [isAuthenticated, addItem, addToast, navigate],
  );
}
