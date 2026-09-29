import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Leva a página ao topo ao trocar de rota. Não existia: saindo da home rolada
 * para /produtos, o catálogo abria no meio da página.
 *
 * Três coisas que o hook não pode atropelar:
 *
 * - O hash. `/#faq` é navegação de seção, e quem posiciona é o `scrollIntoView`
 *   do Header.
 * - O scroll-spy da home, que reescreve o hash com `replace` a cada frame de
 *   scroll. Por isso o gatilho é o `pathname`, nunca a location inteira — senão
 *   rolar a home a jogaria de volta ao topo sem parar.
 * - O botão voltar. Em POP o browser restaura a posição sozinho; forçar o topo
 *   faria "voltar" do produto perder o lugar no catálogo.
 *
 * `page` do catálogo é state local, não search param (`ProductListing.jsx:13`),
 * então paginação não passa por aqui — quem rola é a Fase 10.
 */
export function useScrollRestoration() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    const changedRoute = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    if (!changedRoute || hash || navigationType === 'POP') return;

    // Instantâneo, não `smooth`: a rota nova já está montada e uma animação aqui
    // competiria com o scroll que o usuário fizer em seguida.
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);
}
