# Perguntas Frequentes (FAQ)

Respostas para as perguntas mais comuns sobre o sistema.

## 🚀 Começando

### Como faço para criar uma conta?

Entre em contato com o administrador do sistema da sua organização. Apenas administradores podem criar novas contas de usuário.

### Esqueci minha senha, como recupero?

1. Na tela de login, clique em "Esqueci minha senha"
2. Digite seu email cadastrado
3. Você receberá um link de recuperação
4. Clique no link e defina uma nova senha
5. Faça login com a nova senha

### Posso usar em dispositivos móveis?

Sim! O sistema é totalmente responsivo e funciona em:
- Smartphones (iOS e Android)
- Tablets
- Navegadores mobile

Também temos aplicativos nativos disponíveis:
- [iOS - App Store](https://apps.apple.com)
- [Android - Play Store](https://play.google.com)

## 🔐 Segurança

### Como ativo a autenticação de dois fatores (2FA)?

1. Acesse **Configurações** > **Segurança**
2. Clique em "Ativar 2FA"
3. Escolha o método (app autenticador, SMS ou email)
4. Siga as instruções na tela
5. Salve os códigos de backup em local seguro

### Minha sessão expira muito rápido, posso alterar?

O tempo de expiração é definido pelo administrador por questões de segurança. Entre em contato com o suporte se precisar de ajustes.

### Como sei se minha conexão é segura?

- Verifique se a URL começa com `https://`
- Procure pelo ícone de cadeado no navegador
- Nunca acesse o sistema em redes WiFi públicas sem VPN

## 📊 Funcionalidades

### Como exporto meus dados?

1. Acesse a seção desejada (ex: Registros)
2. Clique no botão "Exportar"
3. Escolha o formato (CSV, Excel, PDF, JSON)
4. Configure os filtros se necessário
5. Clique em "Baixar"

### Posso importar dados de outro sistema?

Sim! O sistema suporta importação de:
- Arquivos CSV
- Planilhas Excel (.xlsx, .xls)
- Arquivos JSON
- Arquivos XML

Veja o [guia de importação](/documentacao/recursos/funcionalidades#importacao).

### Como crio relatórios personalizados?

1. Acesse **Relatórios** > **Novo Relatório**
2. Selecione os dados que deseja incluir
3. Escolha o tipo de visualização (tabela, gráfico, etc.)
4. Configure filtros e agrupamentos
5. Salve o relatório para reutilizar

### Posso agendar relatórios automáticos?

Sim! Ao criar ou editar um relatório:
1. Clique em "Agendar"
2. Defina a frequência (diária, semanal, mensal)
3. Escolha dia e horário
4. Adicione destinatários de email
5. Salve o agendamento

## 🔗 Integrações

### Quais integrações estão disponíveis?

O sistema integra com:
- **Produtividade**: Google Workspace, Microsoft 365
- **Comunicação**: Slack, WhatsApp Business
- **CRM**: Salesforce, HubSpot
- **Pagamentos**: Stripe, PagSeguro
- **Armazenamento**: AWS S3, Dropbox
- **Automação**: Zapier, Make

Veja a [lista completa de integrações](/documentacao/recursos/integracoes).

### Como integro com minha ferramenta favorita?

Se a integração nativa não existe, você pode:
1. Usar nossa [API REST](/api/)
2. Configurar webhooks
3. Usar Zapier ou Make
4. Solicitar desenvolvimento customizado

### A integração é segura?

Sim! Todas as integrações:
- Usam OAuth 2.0 ou API Keys
- Trafegam dados via HTTPS
- Seguem princípio do menor privilégio
- São auditadas regularmente

## 💾 Dados e Backup

### Meus dados estão seguros?

Sim! Implementamos:
- Criptografia em trânsito (TLS 1.3)
- Criptografia em repouso (AES-256)
- Backups diários automáticos
- Redundância geográfica
- Conformidade com LGPD

### Com que frequência é feito backup?

- **Backups automáticos**: Diariamente às 2h
- **Retenção**: 30 dias
- **Backup incremental**: A cada 6 horas
- **Disaster recovery**: Testado mensalmente

### Posso fazer meu próprio backup?

Sim! Você pode:
1. Exportar dados manualmente
2. Usar a API para backup automatizado
3. Configurar sincronização com cloud storage

## 🐛 Problemas Técnicos

### O sistema está lento, o que fazer?

**Soluções rápidas**:
1. Limpe o cache do navegador
2. Feche abas desnecessárias
3. Verifique sua conexão de internet
4. Tente outro navegador
5. Desative extensões do navegador

**Se persistir**:
- Verifique o [status do sistema](https://status.seu-sistema.com)
- Entre em contato com o suporte

### Não consigo fazer upload de arquivos

**Verifique**:
- Tamanho do arquivo (máximo 10 MB por padrão)
- Formato do arquivo (veja formatos suportados)
- Sua conexão de internet
- Espaço disponível na conta

**Formatos suportados**:
- Documentos: PDF, DOC, DOCX, XLS, XLSX
- Imagens: JPG, PNG, GIF, SVG
- Outros: ZIP, CSV, JSON

### Erro "Sessão expirada"

Isso acontece quando:
- Você fica inativo por muito tempo
- Faz login em outro dispositivo
- O token de autenticação expira

**Solução**: Faça login novamente

### Não recebo notificações por email

**Verifique**:
1. Configurações de notificação no sistema
2. Pasta de spam/lixo eletrônico
3. Email cadastrado está correto
4. Servidor de email não está bloqueando

**Configure filtros**:
- Adicione `noreply@seu-sistema.com` aos contatos
- Marque emails como "não é spam"

## 👥 Usuários e Permissões

### Como adiciono novos usuários?

Apenas administradores podem adicionar usuários:
1. **Configurações** > **Usuários** > **Adicionar**
2. Preencha nome, email e cargo
3. Defina nível de acesso
4. Envie convite

### Quais são os níveis de acesso?

| Nível | Permissões |
|-------|------------|
| **Administrador** | Acesso total, incluindo configurações |
| **Gerente** | Acesso a relatórios e gerenciamento de equipe |
| **Usuário** | Acesso às funcionalidades básicas |
| **Visualizador** | Apenas leitura, sem edição |

### Posso ter permissões personalizadas?

Sim! Administradores podem criar perfis customizados com permissões específicas por módulo.

## 📱 Aplicativo Mobile

### Preciso estar online para usar o app?

Não! O app mobile oferece:
- **Modo offline**: Trabalhe sem internet
- **Sincronização automática**: Quando voltar online
- **Cache inteligente**: Dados recentes sempre disponíveis

### Como sincronizo dados no mobile?

A sincronização é automática, mas você pode forçar:
1. Puxe para baixo na tela principal
2. Ou acesse **Configurações** > **Sincronizar agora**

## 💰 Planos e Cobrança

### Quais planos estão disponíveis?

| Plano | Usuários | Armazenamento | Preço |
|-------|----------|---------------|-------|
| **Free** | 5 | 1 GB | Grátis |
| **Basic** | 20 | 10 GB | R$ 99/mês |
| **Pro** | 100 | 100 GB | R$ 299/mês |
| **Enterprise** | Ilimitado | Ilimitado | Personalizado |

### Como faço upgrade do plano?

1. Acesse **Configurações** > **Plano e Cobrança**
2. Clique em "Fazer Upgrade"
3. Escolha o novo plano
4. Confirme o pagamento
5. Upgrade é imediato!

### Posso cancelar a qualquer momento?

Sim! Não há fidelidade:
- Cancele quando quiser
- Sem taxas de cancelamento
- Acesso até o fim do período pago
- Dados exportáveis antes do cancelamento

## 🆘 Suporte

### Como entro em contato com o suporte?

**Canais disponíveis**:
- **Email**: suporte@seu-sistema.com
- **Chat**: Clique no ícone no canto inferior direito
- **Telefone**: (11) 1234-5678
- **WhatsApp**: (11) 91234-5678

**Horário de atendimento**:
- Segunda a Sexta: 8h às 18h
- Sábado: 9h às 13h
- Emergências 24/7 (planos Pro e Enterprise)

### Quanto tempo leva para responder?

| Canal | Tempo médio |
|-------|-------------|
| Chat | 5 minutos |
| Email | 2 horas |
| Telefone | Imediato |
| WhatsApp | 15 minutos |

### Existe documentação técnica?

Sim! Temos:
- [Documentação completa](/documentacao/)
- [API Reference](/api/)
- [Vídeos tutoriais](https://youtube.com/seu-canal)
- [Blog com dicas](https://blog.seu-sistema.com)
- [Comunidade](https://comunidade.seu-sistema.com)

## 🎓 Treinamento

### Oferecem treinamento?

Sim! Oferecemos:
- **Onboarding gratuito**: Para novos clientes
- **Webinars mensais**: Temas variados
- **Treinamento personalizado**: Sob demanda
- **Certificação**: Para usuários avançados

### Onde encontro tutoriais?

- [Documentação](/documentacao/)
- [Canal no YouTube](https://youtube.com/seu-canal)
- [Base de conhecimento](https://ajuda.seu-sistema.com)
- [Blog](https://blog.seu-sistema.com)

## 📞 Ainda tem dúvidas?

Não encontrou sua resposta? Entre em contato:

- 📧 **Email**: suporte@seu-sistema.com
- 💬 **Chat**: Disponível no sistema
- 📱 **WhatsApp**: (11) 91234-5678
- 🌐 **Comunidade**: [comunidade.seu-sistema.com](https://comunidade.seu-sistema.com)

---

<div style="text-align: center; margin-top: 2rem;">
  <p><strong>Esta FAQ foi útil?</strong></p>
  <p>Envie seu <a href="https://forms.gle/feedback">feedback</a> para melhorarmos!</p>
</div>
