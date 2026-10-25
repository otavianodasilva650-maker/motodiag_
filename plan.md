# MotoDiag — plano de implementação

## Produto e escopo

Converter o protótipo HTML anexado em aplicativo móvel real, usando o starter Expo Router / React Native / TypeScript / NativeWind existente. Preservar integralmente o catálogo, IDs, anos/versões, registros técnicos, códigos, hipóteses, sintomas, condições, fontes e ressalvas do anexo. Não criar especificações técnicas para preencher lacunas. A navegação principal terá Início, Motos, Defeitos, Multímetro e Histórico; Administração ficará acessível pelo cabeçalho e pelo Início, para não apertar seis destinos na barra do telefone.

A ficha de cada moto terá todas as 14 seções originais: Visão geral, Sintomas, Sistema elétrico, Resistências, Tensões, Carga, Partida, Ignição, Injeção, Sensores e atuadores, Pinagem, Códigos de falha, Mecânica e Histórico. As versões são independentes; entradas clonadas no anexo são materializadas com seus IDs próprios, sem herança em tempo de execução. Dados técnicos não confirmados continuam sinalizados. Corrigir o aviso contraditório do HTML que dizia não haver dados pré-carregados: existem dados fornecidos pelo proprietário, mas ainda não verificados.

O diagnóstico por sintomas apresenta a lista completa, descrição livre, perguntas de triagem fornecidas, hipóteses agrupadas em elétrica/injeção/mecânica e testes sugeridos; permite registrar observações e seguir para o multímetro. Não é um diagnóstico definitivo nem uma IA conectada. O multímetro interpreta somente referências com situação verificado, limites numéricos válidos e condição aplicável. Valores não verificados e nominais sem faixa não geram aprovação/reprovação. Resultado dentro da faixa não garante que a peça esteja boa.

A Administração local permite criar e editar referências sem apagar o registro antes de salvar (corrigindo o comportamento destrutivo do protótipo), alterar as seis situações originais, desativar/reativar, manter fonte/página e histórico de alterações. Adicionar cadastro local de versões para tornar efetiva a expansão do catálogo sugerida no texto. O histórico salva moto, sintoma, descrição livre, respostas de triagem, observações, data/hora e medições quando houver; exclusão exige confirmação que funcione em Web e nativo.

## Persistência, infraestrutura e evolução

Nesta versão os dados de trabalho ficam no próprio aparelho, como no protótipo: AsyncStorage em nativo e seu adaptador Web no navegador. Contexto/repositório tipado separa persistência de telas e regras; o arquivo de seed tem versão e inserção apenas de IDs novos, preservando edições e desativações existentes. Gravações são serializadas e falhas de armazenamento são exibidas, nunca ignoradas. A próxima atualização pode acrescentar arquivos de catálogo, regras ou um repositório de sincronização sem reescrever as telas. Login e colaboração online não são requisitos desta entrega e não serão inventados.

O starter móvel já dispõe de Express/tRPC/Drizzle e banco MySQL gerenciado. Preservar esses adaptadores e sincronizar o schema do starter com `pnpm db:push` antes do primeiro tráfego. Metro/Web permanece em 8081 e API em 3000. Não adicionar serviço externo, novas bibliotecas sem necessidade ou segredo de usuário.

## Estrutura do projeto

- `app/(tabs)/`: telas principais e navegação Expo Router.
- `app/moto/[id].tsx`: ficha individual com abas técnicas.
- `app/admin.tsx`: administração local de referências e catálogo.
- `components/motodiag/`: cabeçalho, botões, badges, cards, campos, avisos, seletores e confirmação reutilizáveis.
- `lib/motodiag/types.ts`, `domain.ts`: modelos e regras puras de filtro, validação e comparação.
- `lib/motodiag/seed.json`: dados integralmente extraídos do anexo, com versionamento.
- `lib/motodiag/store.tsx`: contexto, hidratação, persistência e operações com auditoria.
- `tests/motodiag.test.ts`: cobertura determinística das regras de dados e medições.
- `assets/images/`: launcher, splash, favicon e ícones Android da identidade MotoDiag.
- `docs/`: orientações curtas para adicionar dados e funcionalidades futuras.
- `server/`, `drizzle/`, `hooks/`, adaptadores existentes: infraestrutura do starter preservada.

## Design (baseado na referência enviada)

**Movimento:** painel técnico de oficina com linguagem editorial industrial. **Princípios:** segurança explícita, hierarquia clara, uso com uma mão, densidade técnica progressiva. **Cores:** azul-marinho transmite precisão; laranja destaca ações; verde é reservado a validação e âmbar a pendência. Superfícies claras e leitura escura por padrão, com tema escuro do sistema.

**Layout:** fluxo vertical de cartões, cabeçalho compacto de marca e barra inferior com cinco destinos. No Início, um painel escuro de diagnóstico e atalhos em lista dupla; dados técnicos aparecem em cartões verticais legíveis, não em tabelas largas. **Elementos assinatura:** filete laranja, badges de estado e medição com números de maior peso. **Interação:** controles com alvos de toque confortáveis, seletores pesquisáveis, aviso junto ao resultado e confirmação de exclusão. **Animação:** transições discretas e feedback de pressão, sem animações decorativas que atrapalhem o trabalho.

**Tipografia:** sistema sans nativo (SF Pro no iOS / Roboto no Android), títulos 24–30, seções 18–20, corpo 14–16, valores técnicos 22–28; NativeWind nos textos e StyleSheet nos contêineres Pressable conforme o starter. **Essência:** diagnóstico organizado, rastreável e cuidadoso para quem cuida de motos. Personalidade: precisa, direta, responsável. **Voz:** “O que vamos investigar?” e “Teste antes de trocar peças.” **Marca:** Moto em branco/grafite e Diag em laranja, acompanhados de um símbolo original de ignição/pulso. **Cor assinatura:** laranja de oficina `#f97316`.

## Fluxo de entrega

Implementar as telas e regras acima, conferir tipos e testes, realizar uma revisão independente somente de leitura contra o anexo e corrigir problemas confirmados. Manter os dois listeners prontos para Preview. Salvar o código validado em checkpoint do repositório Manus. O Preview Web permite revisão no navegador; teste de telefone é via Connect Expo/Expo Go. APK/AAB e iOS/TestFlight são builds separados feitos no Dashboard a partir do checkpoint; esta entrega prepara fonte e configuração, sem declarar um binário nativo antes do build real.
