/**
 * R-007 — Dado nao confirmado. BLOQUEIO.
 *
 * Tres fatos deste projeto nao existem ainda: o ano do evento, o hospital da
 * cirurgia ao vivo e as datas de virada de lote. O kickoff nao disse nenhum dos
 * tres. Peca que os afirma esta inventando.
 *
 * ESTA REGRA LE OS DADOS. Nao ha veto hardcoded aqui, e isso e deliberado: no
 * repo da AExPI a regra de sigilo guardava o fato dentro do proprio codigo, e
 * quando o fato mudou no mundo o motor continuou bloqueando copy correta. Aqui,
 * no dia em que alguem preencher evento.ano em data/perfil-plasticflix.yaml,
 * este veto desliga sozinho — sem tocar em JavaScript.
 *
 * Com o dado preenchido a regra nao fica ociosa: ela passa a cobrar
 * CONSISTENCIA, bloqueando peca que afirme um ano diferente do registrado.
 */
import { achado, normalizar } from './_util.js';
import { carregarYaml } from '../data/carregar.js';

// Ano de quatro digitos plausivel para este evento.
const ANO = /\b(20[2-9]\d)\b/g;

// "marco de 2027", "March 2027", "03/03/2027"
const ANO_COM_MES = /\b(mar[cç]o|march|mar)\b[^\n]{0,12}?\b(20[2-9]\d)\b|\b(20[2-9]\d)\b[^\n]{0,12}?\b(mar[cç]o|march)\b|\b0?[1-7]\/0?3\/(20[2-9]\d)\b/iu;

// Nome proprio depois de "hospital". "hospital em Sao Paulo" e "hospital a
// definir" nao sao nome proprio e nao caem aqui.
// A palavra "hospital" e case-insensitive de proposito; o NOME que vem depois
// nao e — e a maiuscula do nome proprio que distingue "Hospital Albert Einstein"
// de "hospital em Sao Paulo".
const HOSPITAL_NOMEADO = /\b[Hh]ospital\s+(?![Ee]m\b|[Aa]\s+definir\b|[Tt]o\s+be\b|[Dd]e\s+[Ss]ao\s+[Pp]aulo\b|[Ii]n\s+[Ss]ao\s+[Pp]aulo\b|[Aa]\s+[Ss]er\b)([A-ZÀ-Ý][\p{L}'-]+(?:\s+[A-ZÀ-Ý][\p{L}'-]+)*)/u;

// Data ou prazo declarado junto de lote.
const LOTE_COM_PRAZO =
  /\b(1[oº]?\s*lote|2[oº]?\s*lote|primeiro lote|segundo lote|first batch|early bird)\b[^.\n]{0,60}?\b(at[eé]\s+\d|until\s+\d|\d{1,2}\/\d{1,2}|\d{1,2}\s+de\s+\w+|ends\s+\w+|encerra\s+\w+)/iu;
const PRAZO_COM_LOTE =
  /\b(at[eé]\s+\d{1,2}\/\d{1,2}|until\s+\w+\s+\d{1,2}|\d{1,2}\/\d{1,2})\b[^.\n]{0,40}?\b(lote|batch|early bird)\b/iu;

export default function dadoNaoConfirmado(texto, contexto = {}) {
  const achados = [];
  const original = String(texto ?? '');

  const perfil = carregarYaml('perfil-plasticflix');
  const produtos = carregarYaml('produtos');

  const anoRegistrado = perfil?.evento?.ano ?? null;
  const grade = perfil?.evento?.grade ?? [];
  const diaDaCirurgia = grade.find((d) => d.formato === 'cirurgia_ao_vivo');
  const hospitalRegistrado = diaDaCirurgia?.local ?? null;
  const virada1 = produtos?.lotes?.virada_lote_1 ?? null;
  const virada2 = produtos?.lotes?.virada_lote_2 ?? null;

  // 1. Ano do evento.
  const anosNoTexto = [...new Set(original.match(ANO) ?? [])];
  const afirmaAnoDoEvento = ANO_COM_MES.test(original) || (anosNoTexto.length > 0 && /\b(evento|event|prime|congresso|edition|edicao)\b/iu.test(original));

  if (afirmaAnoDoEvento) {
    if (anoRegistrado === null || anoRegistrado === undefined) {
      achados.push(
        achado(
          'R-007',
          'BLOQUEIO',
          `A peca afirma o ano do evento (${anosNoTexto.join(', ')}), e evento.ano esta null em data/perfil-plasticflix.yaml.`,
          'O kickoff disse "primeira semana de marco" sem dizer o ano. Retire o ano da peca ou obtenha a ' +
            'confirmacao do Dr. Mattioli e preencha evento.ano no YAML — este veto desliga sozinho quando o ' +
            'campo for preenchido. Ver lacunas.yaml L-001.',
          { padrao: 'ano-nao-confirmado', anos_no_texto: anosNoTexto, campo: 'evento.ano' }
        )
      );
    } else {
      const divergentes = anosNoTexto.filter((a) => String(a) !== String(anoRegistrado));
      if (divergentes.length > 0) {
        achados.push(
          achado(
            'R-007',
            'BLOQUEIO',
            `A peca afirma o ano ${divergentes.join(', ')} e o ano registrado do evento e ${anoRegistrado}.`,
            `Corrija para ${anoRegistrado}, ou corrija o YAML se o evento mudou de data.`,
            { padrao: 'ano-divergente', anos_no_texto: divergentes, registrado: anoRegistrado }
          )
        );
      }
    }
  }

  // 2. Hospital da cirurgia ao vivo.
  const hospital = original.match(HOSPITAL_NOMEADO);
  if (hospital) {
    if (hospitalRegistrado === null || hospitalRegistrado === undefined) {
      achados.push(
        achado(
          'R-007',
          'BLOQUEIO',
          `A peca nomeia o hospital da cirurgia ao vivo ("${hospital[1]}"), e o local do dia ${diaDaCirurgia?.data ?? '07/03'} esta null no perfil.`,
          'O hospital ainda nao foi definido pelo cliente. Fale da cirurgia ao vivo como parte do encadeamento ' +
            'da semana, sem nomear o local. Ver lacunas.yaml L-002.',
          { padrao: 'hospital-nao-confirmado', nome_no_texto: hospital[1], campo: 'evento.grade[].local' }
        )
      );
    } else if (normalizar(hospital[1]) !== normalizar(hospitalRegistrado)) {
      achados.push(
        achado(
          'R-007',
          'BLOQUEIO',
          `A peca cita "${hospital[1]}" e o hospital registrado e "${hospitalRegistrado}".`,
          'Corrija o nome do hospital para o que esta no perfil.',
          { padrao: 'hospital-divergente', registrado: hospitalRegistrado }
        )
      );
    }
  }

  // 3. Data de virada de lote.
  const afirmaPrazoDeLote = LOTE_COM_PRAZO.test(original) || PRAZO_COM_LOTE.test(original);
  if (afirmaPrazoDeLote && virada1 === null && virada2 === null) {
    achados.push(
      achado(
        'R-007',
        'BLOQUEIO',
        'A peca declara prazo de lote, e as datas de virada estao null em data/produtos.yaml.',
        'A diretoria ainda nao decidiu as datas de corte (ver lacunas.yaml L-004). Use a escassez que ja e real ' +
          'e nao depende de data: 5 vagas no lab de Rino, 10 no de Face, 4 observadores por cirurgiao. ' +
          'Quando lotes.virada_lote_1 for preenchido, este veto desliga sozinho.',
        { padrao: 'virada-de-lote-nao-confirmada', campo: 'lotes.virada_lote_1' }
      )
    );
  }

  return achados;
}
