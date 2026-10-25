
## Segurança e base SaaS

- [x] **Acesso autenticado** — O catálogo e os fluxos de trabalho exigem uma sessão Manus OAuth válida; usuários não autenticados veem apenas a tela de login, sem usuário fictício ou bypass de desenvolvimento.
- [x] **Sessão segura** — O Web usa cookie HttpOnly com `SameSite=None; Secure` no Preview HTTPS; o app nativo guarda o token somente em SecureStore; logout limpa cookie, token e dados de sessão apresentados.
- [x] **Isolamento local** — Histórico, diagnósticos, parâmetros personalizados e auditoria local usam chave por usuário e nunca aparecem para outro usuário do mesmo aparelho.
- [x] **Multiempresa e permissões** — O banco tem organizações e memberships com `owner`, `admin`, `technician` e `viewer`; o contexto e as procedures autenticadas não confiam em papel enviado pelo cliente.
- [x] **Hardening HTTP** — A API aplica cabeçalhos defensivos, CORS restritivo, payload limitado, rate limiting básico em auth/OAuth e mensagens de erro sem segredos.
- [ ] **Base para comercialização** — Separar catálogo técnico de dados privados e manter extensões para convites, sincronização, auditoria, assinatura, cobrança, exportação/backup e MFA/SSO.
