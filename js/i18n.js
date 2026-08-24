(() => {
  "use strict";

  const EN = {
    "skip": "Skip to content",
    "nav.sys": "Systems",
    "nav.cap": "Capabilities",
    "nav.sec": "Security",
    "nav.met": "Method",
    "nav.faq": "FAQ",
    "nav.cta": "Contact",
    "a11y.lang": "Language",
    "a11y.theme": "Toggle theme",
    "a11y.menu": "Menu",
    "hero.badge": "FOURYOU · SOFTWARE ENGINEERING · MX",
    "hero.h1": "The systems your business runs on. <span class=\"grad\">Engineered to never fail.</span>",
    "hero.lead": "Senior engineering for government, banking, retail, automotive and industry. We build new systems, rescue inherited ones and run them without drama.",
    "hero.cta1": "See the systems",
    "hero.cta2": "Talk to engineering",
    "hero.live": "LIVE",
    "hero.tabDeploy": "deploy",
    "hero.tabLegacy": "legacy",
    "hero.stTitle": "PIPELINE STATUS",
    "hero.st1": "build cache",
    "hero.st2": "test coverage",
    "hero.st3": "e2e playwright",
    "hero.st4": "last deploy",
    "hero.act": "ENGINEERING ACTIVITY",
    "hero.actNote": "last 5 weeks · illustrative",
    "dna.s1": "years building critical systems",
    "dna.s2": "industries served",
    "dna.s3": "senior engineers",
    "dna.s4": "operations and support",
    "wrk.eyebrow": "Catalog",
    "wrk.h2": "Fifteen systems, <span class=\"grad\">one engineering standard.</span>",
    "wrk.lead": "Tracking and field first, finance right behind, operations after. Every demo is functional: real flows on simulated data.",
    "wrk.view": "VIEW SYSTEM",
    "wrk.tag": "concept demo · simulated data",
    "wrk.new": "NEW",
    "cl.1t": "Tracking and field",
    "cl.1d": "Where your people and assets are, right now.",
    "cl.2t": "Accounting and finance",
    "cl.2d": "From bank movement to tax stamp, without spreadsheets.",
    "cl.3t": "Operations and commerce",
    "cl.3d": "The rest of the business, with the same discipline.",
    "wrk.tracks": "Field · Sales force",
    "wrk.trackd": "Sales reps and technicians on a live map: daily routes, geofence check-ins and a timeline per employee. Privacy by design: work hours only.",
    "wrk.fleets": "Logistics · Fleet tracking",
    "wrk.fleetd": "Live units on the map, geofences with events and alerts with fix age in milliseconds.",
    "wrk.maps": "GIS · Interactive maps",
    "wrk.mapd": "Switchable layers, coverage, live measurement and territories over your own geographic data.",
    "wrk.ledgers": "Accounting · Reconciliation",
    "wrk.ledgerd": "Bank against general ledger with assisted matching, adjustable tolerances and a zero difference.",
    "wrk.taxs": "Tax · E-invoicing",
    "wrk.taxd": "Issuing and stamping with a checklist, reasoned cancellations and purchase orders with approvals.",
    "wrk.banks": "Banking · Fintech",
    "wrk.bankd": "Transactional stream with fraud rules you can reconfigure live and a verdict per operation.",
    "wrk.shops": "Retail · POS and inventory",
    "wrk.shopd": "Offline-first POS: sell with no network, sync on reconnect and close the register with no surprises.",
    "wrk.flows": "Industrial IoT · SCADA",
    "wrk.flowd": "Plant telemetry with adjustable thresholds, alarms and exact incident replay.",
    "wrk.govs": "Government · Digital services",
    "wrk.govd": "Validated procedures with folio numbers, resumable drafts and an auditable review inbox.",
    "wrk.cars": "Automotive · Sales",
    "wrk.card": "Showroom with a real amortization quote by bank, term and down payment, plus reservations with folio.",
    "wrk.cares": "Healthcare · HL7",
    "wrk.cared": "Clinical roster with live vitals, HL7·FHIR integrations and an audit trail on every access.",
    "wrk.vaults": "Legal · Private AI",
    "wrk.vaultd": "RAG inside your perimeter: answers always cited, zero data leaving your infrastructure.",
    "wrk.turns": "Consumer · Live queues",
    "wrk.turnd": "Real-time turns for branches: the line lives on the phone, not in the lobby.",
    "wrk.devs": "Enterprise · CI/CD",
    "wrk.devd": "Pipelines, runners and continuous quality for large teams that ship every day.",
    "wrk.dates": "Booking · Scheduling",
    "wrk.dated": "Multi-branch calendar with reminders that confirm themselves and occupancy per day.",
    "sage.k": "CROSS-CUTTING CAPABILITY",
    "sage.t": "Sage 300 integration",
    "sage.d": "Journal entries, reconciliation and catalogs synced straight against your ERP. We have run Sage 300 integrations in production for years; Ledger, Tax and Bank speak it out of the box.",
    "svc.eyebrow": "Capabilities",
    "svc.h2": "What this house knows how to do.",
    "svc.1t": "Product engineering",
    "svc.1d": "Web and mobile platforms end to end: from data model to pixel, with weekly deliveries.",
    "svc.2t": "Legacy rescue",
    "svc.2d": "VB.NET, Delphi, AS/400: dependency maps, test harnesses and incremental migration without shutting down the operation.",
    "svc.3t": "Integrations and ERP",
    "svc.3d": "Sage 300, tax authority, banks, WhatsApp Business: your systems talking to each other without re-keying.",
    "svc.4t": "Private AI",
    "svc.4d": "RAG and models inside your perimeter, on-prem or in your cloud. Your data trains no one.",
    "svc.5t": "Real time",
    "svc.5d": "Streams, WebSockets and telemetry with honest latencies, measured and published.",
    "svc.6t": "Maps and geointelligence",
    "svc.6d": "Tracking, geofences, territories and routes: the map as an operations tool, not decoration.",
    "svc.7t": "Cloud and DevOps",
    "svc.7d": "Azure and AWS with CI/CD, infrastructure as code and deployments with no maintenance window.",
    "svc.8t": "Security and compliance",
    "svc.8d": "OAuth2/OIDC, encryption, per-access auditing and industry standards: HL7, PCI, tax authority.",
    "svc.9t": "24/7 operations",
    "svc.9d": "Monitoring, SLOs and incident response: no system gets delivered and abandoned.",
    "sec.eyebrow": "Private AI and security",
    "sec.h2": "Your data trains <span class=\"grad\">no one.</span>",
    "sec.note": "The AI we build lives inside your perimeter: your infrastructure, your keys, your rules. Same goes for this site: zero trackers, zero third-party cookies.",
    "sec.honesty": "No badge theater: we show real architecture and controls, not decorative certifications.",
    "sec.1": "Models and indexes deployed on-prem or in your cloud, never in ours.",
    "sec.2": "None of your data trains third-party models. Contractually and technically.",
    "sec.3": "Encryption in transit and at rest; keys under your control.",
    "sec.4": "Role-based access and an audit trail on every read, including ours.",
    "sec.5": "AI answers always cited against your source documents.",
    "sec.6": "Per-client isolation and NDA by default on every project.",
    "prc.eyebrow": "Method",
    "prc.h2": "Five phases, zero surprises.",
    "prc.1t": "Discovery",
    "prc.1d": "A map of the business and the current system: what hurts, what matters, what gets measured.",
    "prc.2t": "Architecture",
    "prc.2d": "Documented decisions, a phased plan and a closed budget per phase.",
    "prc.3t": "Construction",
    "prc.3d": "Weekly deliveries with a demo from week one. No black boxes.",
    "prc.4t": "Hardening",
    "prc.4d": "Testing, security, load and data migration rehearsed to the point of boredom.",
    "prc.5t": "Operations",
    "prc.5d": "Monitoring, SLOs and continuous evolution. Launch is the start, not the end.",
    "faq.eyebrow": "Straight questions",
    "faq.h2": "What we get asked before signing.",
    "faq.1q": "How does a project start?",
    "faq.1a": "With a two-to-three week discovery: we map your operation and the current system, then deliver scope, risks and a closed budget per phase. If we part ways, the diagnosis is yours.",
    "faq.2q": "Do you work with undocumented legacy systems?",
    "faq.2a": "It is our specialty. We build the dependency map, generate a test harness over real behavior and migrate module by module, without turning the operation off for a single day.",
    "faq.3q": "Do I own the code?",
    "faq.3a": "Yes. Repository, intellectual property and documentation in your name from the first commit. No hidden licenses, no forced dependency on us.",
    "faq.4q": "Can you work inside my infrastructure?",
    "faq.4a": "Yes: on-prem or in your cloud, under your access and audit policies. Private AI was born from exactly that requirement.",
    "faq.5q": "How long does a system take?",
    "faq.5a": "It depends on scope, and we say so with phases, not promises: a typical operable pilot ships in eight to twelve weeks; every following phase has its own date and deliverable.",
    "faq.6q": "What happens after launch?",
    "faq.6a": "24/7 operations with monitoring, SLOs and an evolution plan. No system gets delivered and abandoned; neither does ours.",
    "cta.eyebrow": "Contact",
    "cta.h2": "Tell us what <span class=\"grad\">your operation needs.</span>",
    "cta.note": "We answer in business hours, with engineers, not salespeople. If you are carrying a legacy system on your back, even better.",
    "cta.book": "Write to us directly",
    "cta.booknote": "or book a guided trial of any system in the catalog",
    "cta.fname": "Name",
    "cta.fcompany": "Company",
    "cta.femail": "Email",
    "cta.fdetail": "What system do you need, or what hurts today?",
    "cta.err": "Fill in the highlighted fields.",
    "cta.send": "Send message",
    "cta.hint": "The form opens your email client; nothing is sent to third-party servers.",
    "foot.sys": "Systems",
    "foot.co": "Company",
    "foot.legalT": "Legal",
    "foot.priv": "Privacy notice",
    "foot.terms": "Terms of service",
    "foot.rights": "© 2026 FOURYOU. Software engineering.",
    "meta.title": "FOURYOU — Custom software engineering. Technology Built For You.",
    "meta.desc": "Critical systems for government, banking, retail, automotive and industry: live field tracking, accounting and finance, legacy rescue and private AI. 8+ years of senior engineering."
  };

  const PT = {
    "skip": "Pular para o conteúdo",
    "nav.sys": "Sistemas",
    "nav.cap": "Capacidades",
    "nav.sec": "Segurança",
    "nav.met": "Método",
    "nav.faq": "FAQ",
    "nav.cta": "Contato",
    "a11y.lang": "Idioma",
    "a11y.theme": "Alternar tema",
    "a11y.menu": "Menu",
    "hero.badge": "FOURYOU · ENGENHARIA DE SOFTWARE · MX",
    "hero.h1": "Os sistemas onde seu negócio roda. <span class=\"grad\">Feitos para nunca falhar.</span>",
    "hero.lead": "Engenharia sênior para governo, bancos, varejo, setor automotivo e indústria. Construímos sistemas novos, resgatamos os herdados e os operamos sem drama.",
    "hero.cta1": "Ver os sistemas",
    "hero.cta2": "Falar com a engenharia",
    "hero.live": "AO VIVO",
    "hero.tabDeploy": "deploy",
    "hero.tabLegacy": "legacy",
    "hero.stTitle": "STATUS DO PIPELINE",
    "hero.st1": "cache de build",
    "hero.st2": "cobertura de testes",
    "hero.st3": "e2e playwright",
    "hero.st4": "último deploy",
    "hero.act": "ATIVIDADE DE ENGENHARIA",
    "hero.actNote": "últimas 5 semanas · ilustrativo",
    "dna.s1": "anos construindo sistemas críticos",
    "dna.s2": "indústrias atendidas",
    "dna.s3": "engenheiros sêniores",
    "dna.s4": "operação e suporte",
    "wrk.eyebrow": "Catálogo",
    "wrk.h2": "Quinze sistemas, <span class=\"grad\">uma mesma engenharia.</span>",
    "wrk.lead": "Rastreamento e campo primeiro, finanças logo atrás, operação depois. Cada demo é funcional: fluxos reais com dados simulados.",
    "wrk.view": "VER FICHA",
    "wrk.tag": "demo conceitual · dados simulados",
    "wrk.new": "NOVO",
    "cl.1t": "Rastreamento e campo",
    "cl.1d": "Onde estão sua equipe e seus ativos, agora mesmo.",
    "cl.2t": "Contabilidade e finanças",
    "cl.2d": "Do movimento bancário à nota fiscal, sem planilhas.",
    "cl.3t": "Operação e comércio",
    "cl.3d": "O resto do negócio, com a mesma disciplina.",
    "wrk.tracks": "Campo · Força de vendas",
    "wrk.trackd": "Vendedores e técnicos em mapa ao vivo: rotas do dia, check-in por geocerca e timeline por funcionário. Privacidade por design: só em horário de trabalho.",
    "wrk.fleets": "Logística · Rastreamento de frotas",
    "wrk.fleetd": "Unidades ao vivo no mapa, geocercas com eventos e alertas com idade de fix em milissegundos.",
    "wrk.maps": "SIG · Mapas interativos",
    "wrk.mapd": "Camadas comutáveis, cobertura, medição ao vivo e territórios sobre seus próprios dados geográficos.",
    "wrk.ledgers": "Contabilidade · Conciliação",
    "wrk.ledgerd": "Banco contra razão com matching assistido, tolerâncias ajustáveis e diferença zerada.",
    "wrk.taxs": "Fiscal · Nota fiscal eletrônica",
    "wrk.taxd": "Emissão e carimbo com checklist, cancelamentos com motivo e ordens de compra com aprovações.",
    "wrk.banks": "Bancos · Fintech",
    "wrk.bankd": "Stream transacional com regras de fraude reconfiguráveis ao vivo e parecer por operação.",
    "wrk.shops": "Varejo · PDV e estoque",
    "wrk.shopd": "PDV offline-first: venda sem rede, sincronize ao reconectar e feche o caixa sem surpresas.",
    "wrk.flows": "IoT industrial · SCADA",
    "wrk.flowd": "Telemetria de planta com limites ajustáveis, alarmes e replay exato de incidentes.",
    "wrk.govs": "Governo · Serviços digitais",
    "wrk.govd": "Processos validados com protocolo, rascunho retomável e caixa de análise auditável.",
    "wrk.cars": "Automotivo · Vendas",
    "wrk.card": "Showroom com simulador de financiamento real por banco, prazo e entrada, e reserva com protocolo.",
    "wrk.cares": "Saúde · HL7",
    "wrk.cared": "Roster clínico com sinais vitais ao vivo, integrações HL7·FHIR e auditoria de cada acesso.",
    "wrk.vaults": "Jurídico · IA privada",
    "wrk.vaultd": "RAG dentro do seu perímetro: respostas sempre citadas e zero dados fora da sua infraestrutura.",
    "wrk.turns": "Consumo · Filas ao vivo",
    "wrk.turnd": "Senhas em tempo real para agências: a fila vive no celular, não no salão.",
    "wrk.devs": "Enterprise · CI/CD",
    "wrk.devd": "Pipelines, runners e qualidade contínua para times grandes que fazem deploy todos os dias.",
    "wrk.dates": "Agendamento · Agenda",
    "wrk.dated": "Agenda multiunidade com lembretes que confirmam sozinhos e ocupação por dia.",
    "sage.k": "CAPACIDADE TRANSVERSAL",
    "sage.t": "Integração Sage 300",
    "sage.d": "Lançamentos, conciliação e catálogos sincronizados direto com seu ERP. A casa integra Sage 300 em produção há anos; Ledger, Tax e Bank falam isso de fábrica.",
    "svc.eyebrow": "Capacidades",
    "svc.h2": "O que a casa sabe fazer.",
    "svc.1t": "Engenharia de produto",
    "svc.1d": "Plataformas web e mobile de ponta a ponta: do modelo de dados ao pixel, com entregas semanais.",
    "svc.2t": "Resgate de legado",
    "svc.2d": "VB.NET, Delphi, AS/400: mapa de dependências, harness de testes e migração incremental sem desligar a operação.",
    "svc.3t": "Integrações e ERP",
    "svc.3d": "Sage 300, fisco, bancos, WhatsApp Business: seus sistemas conversando sem redigitação.",
    "svc.4t": "IA privada",
    "svc.4d": "RAG e modelos dentro do seu perímetro, on-prem ou na sua nuvem. Seus dados não treinam ninguém.",
    "svc.5t": "Tempo real",
    "svc.5d": "Streams, WebSockets e telemetria com latências honestas, medidas e publicadas.",
    "svc.6t": "Mapas e geointeligência",
    "svc.6d": "Rastreamento, geocercas, territórios e rotas: o mapa como ferramenta de operação, não enfeite.",
    "svc.7t": "Cloud e DevOps",
    "svc.7d": "Azure e AWS com CI/CD, infraestrutura como código e deploys sem janela de manutenção.",
    "svc.8t": "Segurança e conformidade",
    "svc.8d": "OAuth2/OIDC, criptografia, auditoria por acesso e padrões por setor: HL7, PCI, fisco.",
    "svc.9t": "Operação 24/7",
    "svc.9d": "Monitoramento, SLOs e resposta a incidentes: nenhum sistema é entregue e abandonado.",
    "sec.eyebrow": "IA privada e segurança",
    "sec.h2": "Seus dados não treinam <span class=\"grad\">ninguém.</span>",
    "sec.note": "A IA que construímos vive dentro do seu perímetro: sua infraestrutura, suas chaves, suas regras. O mesmo vale para este site: zero rastreadores, zero cookies de terceiros.",
    "sec.honesty": "Sem teatro de selos: mostramos arquitetura e controles reais, não certificações decorativas.",
    "sec.1": "Modelos e índices implantados on-prem ou na sua nuvem, nunca na nossa.",
    "sec.2": "Nenhum dado seu treina modelos de terceiros. Contratual e tecnicamente.",
    "sec.3": "Criptografia em trânsito e em repouso; chaves sob seu controle.",
    "sec.4": "Acesso por papel e auditoria de cada leitura, inclusive as nossas.",
    "sec.5": "Respostas de IA sempre citadas contra seus documentos-fonte.",
    "sec.6": "Isolamento por cliente e NDA por padrão em cada projeto.",
    "prc.eyebrow": "Método",
    "prc.h2": "Cinco fases, zero surpresas.",
    "prc.1t": "Descoberta",
    "prc.1d": "Mapa do negócio e do sistema atual: o que dói, o que vale, o que se mede.",
    "prc.2t": "Arquitetura",
    "prc.2d": "Decisões documentadas, plano por fases e orçamento fechado por fase.",
    "prc.3t": "Construção",
    "prc.3d": "Entregas semanais com demo desde a primeira semana. Sem caixas-pretas.",
    "prc.4t": "Endurecimento",
    "prc.4d": "Testes, segurança, carga e migração de dados ensaiada até o tédio.",
    "prc.5t": "Operação",
    "prc.5d": "Monitoramento, SLOs e evolução contínua. O lançamento é o começo, não o fim.",
    "faq.eyebrow": "Perguntas diretas",
    "faq.h2": "O que nos perguntam antes de assinar.",
    "faq.1q": "Como começa um projeto?",
    "faq.1a": "Com uma descoberta de duas a três semanas: mapeamos sua operação e o sistema atual e entregamos escopo, riscos e orçamento fechado por fase. Se não seguirmos juntos, o diagnóstico é seu.",
    "faq.2q": "Vocês trabalham com sistemas legados sem documentação?",
    "faq.2a": "É a nossa especialidade. Construímos o mapa de dependências, geramos um harness de testes sobre o comportamento real e migramos por módulos, sem desligar a operação um único dia.",
    "faq.3q": "O código é meu?",
    "faq.3a": "Sim. Repositório, propriedade intelectual e documentação no seu nome desde o primeiro commit. Sem licenças ocultas nem dependência forçada de nós.",
    "faq.4q": "Podem trabalhar dentro da minha infraestrutura?",
    "faq.4a": "Sim: on-prem ou na sua nuvem, com suas políticas de acesso e auditoria. A IA privada nasceu exatamente desse requisito.",
    "faq.5q": "Quanto tempo leva um sistema?",
    "faq.5a": "Depende do escopo, e dizemos isso com fases, não promessas: um piloto operável típico sai em oito a doze semanas; cada fase seguinte tem data e entregável próprios.",
    "faq.6q": "O que acontece depois do lançamento?",
    "faq.6a": "Operação 24/7 com monitoramento, SLOs e plano de evolução. Nenhum sistema é entregue e abandonado; o nosso também não.",
    "cta.eyebrow": "Contato",
    "cta.h2": "Conte o que <span class=\"grad\">sua operação precisa.</span>",
    "cta.note": "Respondemos em horário comercial, com engenheiros, não vendedores. Se você carrega um sistema legado nas costas, melhor ainda.",
    "cta.book": "Escreva direto para nós",
    "cta.booknote": "ou agende um teste guiado de qualquer sistema do catálogo",
    "cta.fname": "Nome",
    "cta.fcompany": "Empresa",
    "cta.femail": "E-mail",
    "cta.fdetail": "Qual sistema você precisa, ou o que dói hoje?",
    "cta.err": "Preencha os campos destacados.",
    "cta.send": "Enviar mensagem",
    "cta.hint": "O formulário abre seu e-mail; nada é enviado a servidores de terceiros.",
    "foot.sys": "Sistemas",
    "foot.co": "Empresa",
    "foot.legalT": "Legal",
    "foot.priv": "Aviso de privacidade",
    "foot.terms": "Termos de serviço",
    "foot.rights": "© 2026 FOURYOU. Engenharia de software.",
    "meta.title": "FOURYOU — Engenharia de software sob medida. Technology Built For You.",
    "meta.desc": "Sistemas críticos para governo, bancos, varejo, setor automotivo e indústria: rastreamento de campo ao vivo, contabilidade e finanças, resgate de legado e IA privada. 8+ anos de engenharia sênior."
  };

  const DICTS = { en: EN, pt: PT };
  const LANG_ATTR = { es: "es", en: "en", pt: "pt-BR" };
  const KEY = "fy-lang";
  const ES = {};
  let current = "es";

  const nodes = () => document.querySelectorAll("[data-i18n], [data-i18n-html], [data-i18n-aria]");

  const capture = () => {
    nodes().forEach((el) => {
      if (el.dataset.i18n && !(el.dataset.i18n in ES)) ES[el.dataset.i18n] = el.textContent;
      if (el.dataset.i18nHtml && !(el.dataset.i18nHtml in ES)) ES[el.dataset.i18nHtml] = el.innerHTML;
      if (el.dataset.i18nAria && !(el.dataset.i18nAria in ES)) ES[el.dataset.i18nAria] = el.getAttribute("aria-label") || "";
    });
    ES["meta.title"] = document.title;
    const md = document.querySelector("meta[name='description']");
    ES["meta.desc"] = md ? md.getAttribute("content") : "";
  };

  const lookup = (lang, key) => {
    if (lang === "es") return ES[key];
    const d = DICTS[lang];
    return d && key in d ? d[key] : ES[key];
  };

  const apply = (lang) => {
    nodes().forEach((el) => {
      if (el.dataset.i18n) {
        const v = lookup(lang, el.dataset.i18n);
        if (v !== undefined) el.textContent = v;
      }
      if (el.dataset.i18nHtml) {
        const v = lookup(lang, el.dataset.i18nHtml);
        if (v !== undefined) el.innerHTML = v;
      }
      if (el.dataset.i18nAria) {
        const v = lookup(lang, el.dataset.i18nAria);
        if (v !== undefined) el.setAttribute("aria-label", v);
      }
    });
    const t = lookup(lang, "meta.title");
    if (t) document.title = t;
    const md = document.querySelector("meta[name='description']");
    const dsc = lookup(lang, "meta.desc");
    if (md && dsc) md.setAttribute("content", dsc);
    document.documentElement.lang = LANG_ATTR[lang];
    document.querySelectorAll("[data-setlang]").forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset.setlang === lang ? "true" : "false");
    });
    current = lang;
    window.FY_LANG = lang;
    document.dispatchEvent(new CustomEvent("fy:lang", { detail: { lang } }));
  };

  const setLang = (lang, fade) => {
    if (!(lang in LANG_ATTR)) lang = "es";
    if (lang === current && document.documentElement.lang === LANG_ATTR[lang]) return;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    if (fade && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("lang-fading");
      setTimeout(() => {
        apply(lang);
        requestAnimationFrame(() => document.body.classList.remove("lang-fading"));
      }, 120);
    } else {
      apply(lang);
    }
  };

  const report = () => {
    const domKeys = new Set();
    nodes().forEach((el) => {
      if (el.dataset.i18n) domKeys.add(el.dataset.i18n);
      if (el.dataset.i18nHtml) domKeys.add(el.dataset.i18nHtml);
      if (el.dataset.i18nAria) domKeys.add(el.dataset.i18nAria);
    });
    domKeys.add("meta.title");
    domKeys.add("meta.desc");
    const missEn = [...domKeys].filter((k) => !(k in EN));
    const missPt = [...domKeys].filter((k) => !(k in PT));
    const extraEn = Object.keys(EN).filter((k) => !domKeys.has(k));
    const extraPt = Object.keys(PT).filter((k) => !domKeys.has(k));
    console.info(`fy-i18n · dom ${domKeys.size} · en ${Object.keys(EN).length} · pt ${Object.keys(PT).length} · missing en ${missEn.length} · missing pt ${missPt.length}`);
    if (missEn.length) console.warn("fy-i18n · claves sin EN:", missEn);
    if (missPt.length) console.warn("fy-i18n · claves sin PT:", missPt);
    if (extraEn.length) console.warn("fy-i18n · EN sin uso en DOM:", extraEn);
    if (extraPt.length) console.warn("fy-i18n · PT sin uso en DOM:", extraPt);
  };

  const init = () => {
    capture();
    report();
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    const urlLang = new URLSearchParams(location.search).get("lang");
    const start = (urlLang && urlLang in LANG_ATTR) ? urlLang : (saved && saved in LANG_ATTR ? saved : "es");
    if (start !== "es") apply(start);
    else apply("es");
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-setlang]");
      if (btn) setLang(btn.dataset.setlang, true);
    });
  };

  window.fySetLang = (l) => setLang(l, true);
  window.FY_LANG = "es";
  window.FY_I18N = { es: ES, en: EN, pt: PT };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
