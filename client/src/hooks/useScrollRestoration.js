import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Quanto tempo a âncora persegue a seção enquanto o conteúdo acima dela carrega.
const SETTLE_MS = 2000;
// Qualquer um destes devolve o scroll ao usuário na hora.
const USER_INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

/**
 * Leva a seção da âncora para a tela, perseguindo-a enquanto a página cresce.
 *
 * Vindo de outra rota, a Home monta com Categorias e Produtos ainda vazios: um
 * scroll único cai na posição certa e, quando os dados chegam, a seção é empurrada
 * milhares de pixels para baixo. Então o alinhamento se repete a cada mudança de
 * altura do `body`, até assentar ou o usuário assumir o scroll.
 */
function followAnchor(id) {
  const align = () => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });

  const observer = new ResizeObserver(align);
  const stop = () => {
    observer.disconnect();
    clearTimeout(timer);
    USER_INPUT.forEach((type) => window.removeEventListener(type, stop));
  };
  const timer = setTimeout(stop, SETTLE_MS);

  align();
  observer.observe(document.body);
  USER_INPUT.forEach((type) => window.addEventListener(type, stop, { passive: true }));
  return stop;
}

/**
 * Posição de scroll ao navegar. Antes do hook, sair da Home rolada para
 * `/produtos` abria o catálogo no meio da página.
 *
 * - Rota nova, sem hash: topo. Instantâneo de verdade (`behavior: 'instant'`) —
 *   o `html` tem `scroll-behavior: smooth`, e um `scrollTo(0, 0)` cru animaria.
 * - Hash por PUSH (Footer, Header vindo de outra página, qualquer `<Link>`): a
 *   seção. Na mesma rota o conteúdo já está lá, então rola suave; em rota nova,
 *   persegue a seção (`followAnchor`).
 * - Hash por REPLACE: nada. É o scroll-spy da Home reescrevendo a URL enquanto o
 *   usuário rola, ou o clique do Header na própria Home, que rola sozinho.
 * - POP (voltar): nada. O browser restaura a posição.
 *
 * `page` do catálogo é state local, não search param (`ProductListing.jsx:13`),
 * então paginação não passa por aqui — quem rola é a Fase 10.
 */
export function useScrollRestoration() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const prevPathnameRef = useRef(pathname);
  const stopFollowRef = useRef(null);

  useLayoutEffect(() => {
    const changedRoute = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    if (navigationType === 'POP') return;

    // Navegação nova encerra a perseguição anterior. REPLACE não: o spy reescreve
    // o hash justamente durante ela, a cada scroll que o alinhamento causa.
    if (navigationType === 'PUSH') stopFollowRef.current?.();

    if (hash && navigationType === 'PUSH') {
      const id = decodeURIComponent(hash.slice(1));
      if (changedRoute) {
        stopFollowRef.current = followAnchor(id);
      } else {
        stopFollowRef.current = null;
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (changedRoute && !hash) window.scrollTo({ top: 0, behavior: 'instant' });
    // `key` muda a cada navegação: dois cliques no mesmo link de âncora são dois PUSH.
  }, [key, pathname, hash, navigationType]);

  useEffect(() => () => stopFollowRef.current?.(), []);
}
