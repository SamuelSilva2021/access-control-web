# Access Control Web - Guia de Teste

## ✅ Status Atual

A aplicação está **funcionando** e configurada para se conectar com sua API:

- URL da API: `https://localhost:7019`
- Endpoint de login: `https://localhost:7019/api/auth/login`

## 🚀 Como Testar

### 1. Inicie sua API
Certifique-se de que sua API está rodando em `https://localhost:7019`

### 2. Inicie o Frontend
```bash
cd access-control-web
npm run dev
```
A aplicação estará disponível em: `http://localhost:5173/`

### 3. Teste o Login
1. Acesse `http://localhost:5173/`
2. Será redirecionado para a tela de login
3. Preencha:
   - **Email ou Username**: Use um usuário válido da sua API
   - **Senha**: Use a senha correspondente
4. Clique em "Entrar"

## 📋 Estrutura de Request/Response

### Request (Frontend → API)
```json
POST https://localhost:7019/api/auth/login
{
  "usernameOrEmail": "usuario@email.com",
  "password": "senha123"
}
```

### Response Esperada (API → Frontend)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "def...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "userInfo": {
      "id": "guid-do-usuario",
      "username": "usuario",
      "email": "usuario@email.com",
      "firstName": "Nome",
      "lastName": "Sobrenome",
      "fullName": "Nome Sobrenome",
      "tenantId": "guid-do-tenant",
      "tenantSlug": "slug-tenant",
      "permissions": ["permission1", "permission2"],
      "roles": ["role1", "role2"]
    }
  }
}
```

## 🔧 Configurações CORS

Certifique-se de que sua API está configurada para aceitar requests do frontend:

```csharp
// No Program.cs ou Startup.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// E no pipeline:
app.UseCors("AllowReactApp");
```

## 🐛 Troubleshooting

### Erro de CORS
```
Access to XMLHttpRequest at 'https://localhost:7019/api/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solução**: Configure CORS na sua API (veja seção acima)

### Erro de SSL
```
NET::ERR_CERT_AUTHORITY_INVALID
```
**Solução**: No navegador, acesse `https://localhost:7019` primeiro e aceite o certificado

### Erro 401 - Unauthorized
```
Login failed: Credenciais inválidas
```
**Solução**: Verifique se o usuário/senha existem na sua base de dados

### API não responde
```
Network Error
```
**Solução**: 
1. Verifique se a API está rodando em `https://localhost:7019`
2. Teste diretamente: `curl https://localhost:7019/health`

## 📊 Próximos Passos

Após o login funcionar, o sistema vai:

1. ✅ **Salvar o token** no localStorage
2. ✅ **Redirecionar** para o dashboard (`/dashboard`)
3. ✅ **Proteger rotas** com base na autenticação
4. ✅ **Mostrar informações** do usuário logado
5. 🚧 **Gerenciar usuários** (próxima funcionalidade)
6. 🚧 **Gerenciar grupos** (próxima funcionalidade)
7. 🚧 **Gerenciar permissões** (próxima funcionalidade)

## 📝 Notas Técnicas

### Arquitetura
- **Frontend**: React 19 + TypeScript + Material-UI
- **Estado**: Zustand (autenticação) + React Query (dados de servidor)
- **Validação**: React Hook Form + Zod
- **Roteamento**: React Router v7

### Estrutura
```
src/
├── features/auth/          # Tela de login
├── features/dashboard/     # Dashboard principal
├── shared/stores/         # Estado global (Zustand)
├── shared/types/          # Tipos TypeScript
├── shared/hooks/          # Hooks personalizados
└── app/routes/            # Configuração de rotas
```

### Tokens
- **Access Token**: Usado em todas as requisições (Authorization: Bearer)
- **Refresh Token**: Para renovar tokens expirados (futuro)
- **Armazenamento**: localStorage (desenvolvimento) 

---

**🎯 Objetivo**: Validar a integração frontend ↔ backend antes de implementar as telas de CRUD