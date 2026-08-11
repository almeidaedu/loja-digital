# Módulo 02 — Runtime JavaScript

Semanas 4–5 (~20 h). Fontes primárias: MDN e docs oficiais do Node.js.

## Objetivo

Entender o que o runtime realmente faz — event loop, promises, streams,
sistema de módulos, GC — para escrever código de SDK **previsível**: sem
vazamento de memória, sem rejection não tratada, cancelável, e que roda em
Node e browser sem gambiarra. Ao final, o transporte HTTP do SDK existe:
fetch com retry, backoff e cancelamento, sem nenhuma API Node-only no core.

## Pré-requisitos

- Módulo 01 concluído (o transporte será escrito em TS strict)
- Node 20+ (fetch nativo disponível)

## Leitura essencial

**Event loop e promises:**

1. [JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model) (MDN)
2. [Using microtasks in JavaScript with queueMicrotask()](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) (MDN)
3. [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) (MDN)
4. [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — fases, timers, `process.nextTick`
5. [Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)

**Cancelamento e rede:**

6. [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) (MDN) — incluindo `AbortSignal.timeout()` e `AbortSignal.any()`
7. [undici](https://undici.nodejs.org) — o fetch do Node por dentro (pooling, keep-alive)

**Streams e binário:**

8. [Stream](https://nodejs.org/api/stream.html) (Node API) — foco em backpressure, `highWaterMark`, `pipeline()`
9. [Web Streams](https://nodejs.org/api/webstreams.html) — a versão portável (browser/edge)
10. [Buffer](https://nodejs.org/api/buffer.html) — e por que o core do SDK usa `Uint8Array`/`TextEncoder` em vez de Buffer

**Sistema de módulos (crítico para autor de SDK):**

11. [CommonJS modules](https://nodejs.org/api/modules.html)
12. [ECMAScript modules](https://nodejs.org/api/esm.html) — interop com CJS
13. [Packages](https://nodejs.org/api/packages.html) — `exports` condicionais e o **dual package hazard**

## Conceitos para dominar

- [ ] Call stack, task queue (macrotasks) e microtask queue; ordem exata de `setTimeout` vs `.then` vs `queueMicrotask` vs `process.nextTick` vs `setImmediate`
- [ ] O executor de `new Promise()` roda síncrono; `await` desaçucara para `.then` + microtask
- [ ] Unhandled rejections: como surgem e por que um SDK jamais pode gerar uma
- [ ] Backpressure: o que `write()` retornando `false` significa; por que `pipeline()` e não `.pipe()`
- [ ] `AbortSignal`: propagação em cadeia, compor timeout + signal do usuário com `AbortSignal.any()`
- [ ] CJS vs ESM: resolução, interop de default export, extensões obrigatórias em ESM, dual package hazard
- [ ] `exports` map e conditions (`import`, `require`, `types`, `browser`)
- [ ] GC na prática: retenção por closures, listeners e timers não limpos — as três fontes clássicas de leak em SDK
- [ ] `fetch` no Node é undici: keep-alive e pooling já inclusos; quando isso importa
- [ ] Restrições cross-runtime: core do SDK sem `process`, sem `Buffer`, sem imports `node:*`

## Exercícios

Rascunhos em `roadmap/exercicios/02-runtime/`.

**1. Quiz do event loop.** Escreva 10 snippets misturando `setTimeout`,
promises, `async/await`, `process.nextTick` e `setImmediate`. Preveja a saída
por escrito ANTES de rodar, depois confira com `node`. Exemplo do nível
esperado:

```js
async function main() {
  console.log(1);
  setTimeout(() => console.log(2));
  Promise.resolve().then(() => console.log(3));
  process.nextTick(() => console.log(4));
  await null;
  console.log(5);
}
main().then(() => console.log(6));
console.log(7);
```

Aceite: 10/10 acertos com explicação escrita de cada ordem.

**2. `fetchWithRetry` sem dependências.** Em TypeScript strict:

- Timeout por tentativa via `AbortSignal.timeout()`, composto com o signal do
  chamador via `AbortSignal.any([user, timeout])`
- Backoff exponencial com full jitter: `sleep(random(0, min(cap, base * 2 ** attempt)))`
- Retry **apenas** em 429, 5xx e erro de rede; nunca em 4xx de validação
- Respeitar `Retry-After` (formato em segundos e em data HTTP)
- Máximo de tentativas configurável; erro final preserva a causa (`cause`)

Teste manual contra um servidor local que falha de propósito:

```js
// exercicios/02-runtime/flaky-server.mjs
import http from 'node:http';
let n = 0;
http.createServer((req, res) => {
  n++;
  if (n % 3 !== 0) {
    res.writeHead(503, { 'Retry-After': '1' });
    return res.end('quebrado de proposito');
  }
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ tentativa: n }));
}).listen(3999);
```

Aceite: contra esse servidor, a chamada resolve na 3a tentativa, respeitando
o `Retry-After`; com `maxRetries: 1` ela rejeita com o erro da última resposta.

**3. Streams com backpressure.** Script que exporta os produtos do Postgres
como NDJSON usando paginação por cursor no Prisma e um `Transform` que
converte para CSV, ligados com `pipeline()`. Compare o pico de memória com a
versão naive (`findMany()` de tudo + `join`) usando
`process.memoryUsage().heapUsed` — popule ~100k linhas sintéticas antes.
Aceite: a versão em stream mantém memória estável; a naive cresce linear.

**4. Lab ESM/CJS.** Crie `lab-dual/` com um pacote mínimo publicável com
`exports` condicionais (`import` + `require`). Consuma de um script CJS e de
um ESM. Documente em `esm-cjs-notas.md` pelo menos 3 pegadinhas encontradas
(interop de default export, extensão obrigatória no ESM, ausência de
`__dirname`, o que acontece quando as duas cópias carregam juntas).
Aceite: notas escritas com exemplos de código que reproduzem cada pegadinha.

## Entrega no capstone

`sdk/src/http/transport.ts` — o transporte que o SDK inteiro vai usar:

- Assinatura: `transport(request: TransportRequest, options: TransportOptions): Promise<TransportResponse>`
- Retry/backoff/`Retry-After` do exercício 2, agora como código de produto
- Timeout por request + `AbortSignal` do chamador
- `fetch` injetável via options (essencial para os testes do módulo 05)
- **Isomórfico**: zero imports `node:*`, zero `Buffer`, zero `process` —
  compila e roda em Node 20+, no `client/` Vite e em edge runtime

Comando de verificação (rode você): `cd sdk && npx tsc --noEmit`.

## Critérios de conclusão

- [ ] Explica a ordem completa de um snippet misturando nextTick, timers,
      promises e setImmediate — sem rodar
- [ ] `fetchWithRetry` passa no teste do servidor flaky, incluindo `Retry-After`
- [ ] Versão em stream do export processa 100k linhas com memória estável
- [ ] Cita de memória 3 pegadinhas de interop ESM/CJS e o que é o dual package hazard
- [ ] `transport.ts` compila e não contém nenhum import `node:*`

## Aprofundamento

- `worker_threads` e quando CPU-bound justifica sair do event loop
- Heap snapshots com `node --inspect` + Chrome DevTools: ache um leak plantado
  de propósito (listener não removido em um `setInterval`)
- Código-fonte do undici: como um pool de conexões é implementado
