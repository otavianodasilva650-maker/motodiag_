# MotoDiag — base segura para SaaS multiempresa

## Objetivo

Evoluir o aplicativo local para uma base pronta para venda a oficinas e profissionais, sem prometer segurança absoluta. O núcleo usa Manus OAuth como provedor padrão, sessões server-side/assinadas já fornecidas pelo starter, SecureStore no celular, cookies HttpOnly no Web, autorização no servidor e isolamento por organização.

## Entrega desta fase

- Bloquear o catálogo e os fluxos do app para usuários não autenticados.
- Manter OAuth Manus; não criar senha própria nem duplicar credenciais.
- Isolar o armazenamento local por `openId`, limpar a sessão de dados quando necessário e não confiar em `localStorage` para autenticação.
- Criar organizações e associação de membros com papéis `owner`, `admin`, `technician` e `viewer` no banco.
- Expor no servidor o contexto autenticado e a organização ativa, com autorização centralizada para futuras APIs.
- Adicionar cabeçalhos HTTP defensivos, limite de payload, rate limiting básico para OAuth/auth e CORS restritivo ao Preview/app.
- Manter o catálogo técnico como seed somente leitura local, sem misturá-lo com dados privados da oficina.
- Deixar pontos de extensão para convites, sincronização do histórico, assinatura e cobrança em fase posterior.

## Modelo de segurança

O cliente não será a autoridade: toda futura leitura/escrita de dados de oficina deverá passar por `protectedProcedure` e checar `organizationId`/membership no servidor. O papel do usuário na tabela de membros, e não um campo enviado pelo celular, determina permissões. O catálogo público/validado é separado de diagnósticos, histórico e parâmetros privados da organização.

## Organização do código

- `drizzle/schema.ts`: organizações, membros e enum de papéis.
- `server/db.ts`: criação/consulta de organização padrão e memberships.
- `server/_core/context.ts`: usuário autenticado e organização resolvida.
- `server/_core/security.ts`: cabeçalhos, rate limit e parsing seguro.
- `server/routers.ts`: procedures autenticadas e base para APIs multi-tenant.
- `app/_layout.tsx` e `components/auth-gate.tsx`: gate real de login.
- `lib/motodiag/store.tsx`: persistência local com chave por usuário/organização.

## Próxima fase comercial

Convites por organização, sincronização do histórico para banco, recuperação/auditoria, planos e Stripe, MFA/SSO corporativo, exportação/backup e política de retenção devem ser adicionados antes de uma abertura ampla para clientes. O login atual segue Manus OAuth, conforme o padrão seguro do starter.
