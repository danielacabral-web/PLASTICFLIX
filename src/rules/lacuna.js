/**
 * R-009 — Lacuna bloqueante. BLOQUEIO.
 *
 * Se a peca declara que depende de uma pendencia que ainda esta aberta e
 * marcada como bloqueante em data/lacunas.yaml, ela nao passa. E o mecanismo
 * que impede produzir em cima de dado que nao chegou.
 *
 * O texto da lacuna carrega o "segue mesmo assim" — o que ainda da para fazer
 * enquanto a pendencia nao se resolve. A acao do achado devolve isso, porque
 * bloqueio sem caminho alternativo so paralisa.
 *
 * Le tudo de data/lacunas.yaml. Fechou a lacuna no YAML (bloqueante: false ou
 * situacao resolvida), a regra para de bloquear sozinha.
 */
import { achado } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

const SITUACOES_RESOLVIDAS = new Set(['resolvida', 'fechada', 'entregue', 'concluida']);

export default function lacuna(texto, contexto = {}) {
  const declaradas = contexto.depende_de ?? contexto.lacuna_ref ?? null;
  if (!declaradas) return null;

  const ids = Array.isArray(declaradas) ? declaradas : [declaradas];
  if (ids.length === 0) return null;

  const dados = carregarYaml('lacunas');
  const catalogo = dados?.lacunas ?? [];
  const achados = [];

  for (const id of ids) {
    const l = catalogo.find((x) => x.id === id);

    if (!l) {
      achados.push(
        achado(
          'R-009',
          'ALERTA',
          `O contexto declara dependencia de "${id}", que nao existe em data/lacunas.yaml.`,
          'Confira o id. Se a pendencia e real e nova, registre-a no YAML com evidencia, o que ela bloqueia ' +
            'e o que segue mesmo assim — pendencia que nao esta escrita nao e cobrada de ninguem.',
          { padrao: 'lacuna-inexistente', lacuna_ref: id }
        )
      );
      continue;
    }

    const resolvida = SITUACOES_RESOLVIDAS.has(String(l.situacao ?? '').toLowerCase());
    if (resolvida || l.bloqueante !== true) continue;

    achados.push(
      achado(
        'R-009',
        'BLOQUEIO',
        `A peca depende de ${l.id} — ${l.titulo} — que esta aberta e marcada como bloqueante (situacao: ${l.situacao}).`,
        `O que ainda da para fazer: ${String(l.segue_mesmo_assim ?? 'nao registrado').trim()} ` +
          `Para destravar: ${String(l.pedido_ao_cliente ?? 'nao registrado').trim()}`,
        {
          padrao: 'lacuna-bloqueante',
          lacuna_ref: l.id,
          situacao: l.situacao,
          bloqueia: l.bloqueia ?? [],
        }
      )
    );
  }

  return achados;
}
