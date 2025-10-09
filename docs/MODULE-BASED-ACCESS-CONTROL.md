# Controle de Acesso Baseado em Módulos

## Visão Geral

Este documento descreve a implementação de um sistema de controle de acesso baseado em módulos e operações para o frontend React, onde componentes e rotas são renderizados condicionalmente baseado nas permissões do usuário.

## Estrutura de Permissões

### Resposta da API `/me`

```json
{
  "data": {
    "permissions": {
      "userId": "uuid",
      "accessGroups": [
        {
          "id": "uuid",
          "code": "MASTER",
          "roles": [
            {
              "id": "uuid", 
              "code": "MASTER",
              "modules": [
                {
                  "id": "uuid",
                  "key": "USER_MODULE",
                  "operations": ["CREATE", "SELECT", "UPDATE", "DELETE"]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### Mapeamento de Módulos

| Módulo Key | Descrição | Componentes Afetados |
|------------|-----------|---------------------|
| `USER_MODULE` | Gestão de Usuários | UserList, UserForm, UserDetails |
| `ORDER_MODULE` | Gestão de Pedidos | OrderList, OrderForm, OrderDetails |
| `ACCESS_GROUP` | Controle de Acesso | AccessGroupList, RoleManager |

### Operações Suportadas

- `CREATE` - Criar novos registros
- `SELECT` - Visualizar/listar registros
- `UPDATE` - Editar registros existentes
- `DELETE` - Excluir registros

## Implementação

### 1. Tipos TypeScript

Atualizaremos os tipos para refletir a nova estrutura hierárquica:

```typescript
interface UserPermissions {
  userId: string;
  accessGroups: AccessGroup[];
}

interface AccessGroup {
  id: string;
  code: string;
  roles: Role[];
}

interface Role {
  id: string;
  code: string;
  modules: Module[];
}

interface Module {
  id: string;
  key: string;
  operations: Operation[];
}

type Operation = 'CREATE' | 'SELECT' | 'UPDATE' | 'DELETE';
```

### 2. Permission Store

Criaremos um store dedicado para gerenciar permissões:

```typescript
class PermissionStore {
  // Verifica se usuário tem acesso a um módulo específico
  hasModuleAccess(moduleKey: string): boolean

  // Verifica se usuário pode realizar operação em módulo
  canPerformOperation(moduleKey: string, operation: Operation): boolean

  // Obtém todos os módulos acessíveis
  getAccessibleModules(): string[]

  // Obtém operações permitidas para um módulo
  getModuleOperations(moduleKey: string): Operation[]
}
```

### 3. Componentes de Proteção

#### ProtectedRoute
Protege rotas inteiras baseado no acesso ao módulo:

```typescript
interface ProtectedRouteProps {
  moduleKey: string;
  operation?: Operation;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

#### ProtectedComponent
Protege componentes específicos baseado em operações:

```typescript
interface ProtectedComponentProps {
  moduleKey: string;
  operation: Operation;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

### 4. Hooks Personalizados

#### usePermissions
```typescript
const usePermissions = () => {
  const hasAccess = (moduleKey: string, operation?: Operation) => boolean;
  const getAccessibleModules = () => string[];
  const canCreate = (moduleKey: string) => boolean;
  const canRead = (moduleKey: string) => boolean;
  const canUpdate = (moduleKey: string) => boolean;
  const canDelete = (moduleKey: string) => boolean;
}
```

### 5. Roteamento Dinâmico

O sistema de rotas será gerado dinamicamente baseado nos módulos acessíveis:

```typescript
const generateRoutes = (accessibleModules: string[]) => {
  return routes.filter(route => 
    accessibleModules.includes(route.moduleKey)
  );
};
```

### 6. Menu Dinâmico

O menu lateral será renderizado condicionalmente:

```typescript
const MenuItem = ({ moduleKey, label, icon }) => {
  const { hasAccess } = usePermissions();
  
  if (!hasAccess(moduleKey, 'SELECT')) {
    return null;
  }
  
  return <MenuLink to={`/${moduleKey.toLowerCase()}`} />;
};
```

## Fluxo de Implementação

### Fase 1: Atualização de Tipos
1. Atualizar `auth.types.ts` com nova estrutura
2. Criar `permission.types.ts` para tipos específicos

### Fase 2: Permission Store
1. Implementar `PermissionStore` 
2. Integrar com `AuthStore`
3. Adicionar métodos de verificação

### Fase 3: Componentes de Proteção
1. Criar `ProtectedRoute` component
2. Criar `ProtectedComponent` component
3. Implementar `usePermissions` hook

### Fase 4: Aplicação
1. Proteger rotas existentes
2. Implementar menu dinâmico
3. Proteger botões de ação (CRUD)

### Fase 5: Testes
1. Testes unitários para Permission Store
2. Testes de integração para componentes
3. Testes E2E para fluxos completos

## Exemplo de Uso

```typescript
// Proteção de rota
<ProtectedRoute moduleKey="USER_MODULE" operation="SELECT">
  <UserListPage />
</ProtectedRoute>

// Proteção de componente
<ProtectedComponent moduleKey="USER_MODULE" operation="CREATE">
  <CreateUserButton />
</ProtectedComponent>

// Hook personalizado
const UserActions = () => {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  
  return (
    <div>
      {canCreate('USER_MODULE') && <CreateButton />}
      {canUpdate('USER_MODULE') && <EditButton />}
      {canDelete('USER_MODULE') && <DeleteButton />}
    </div>
  );
};
```

## Benefícios

1. **Segurança**: Componentes não autorizados não são nem renderizados
2. **Performance**: Reduz código desnecessário no bundle
3. **UX**: Interface limpa mostrando apenas o que é relevante
4. **Manutenibilidade**: Sistema centralizado e declarativo
5. **Escalabilidade**: Fácil adição de novos módulos e operações

## Considerações de Segurança

- Validação no backend é sempre obrigatória
- Frontend apenas esconde interface, não garante segurança
- Tokens JWT devem conter claims de permissão para validação rápida
- Cache de permissões deve ter TTL adequado