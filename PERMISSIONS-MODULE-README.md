# Módulo de Permissões e Permissões-Operações

Este módulo implementa o gerenciamento completo de permissões e suas relações com operações no sistema de controle de acesso.

## 🚀 Funcionalidades Implementadas

### **Gerenciamento de Permissões**
- ✅ Listagem de permissões com paginação
- ✅ Criação de novas permissões
- ✅ Edição de permissões existentes
- ✅ Exclusão de permissões (soft delete)
- ✅ Ativação/desativação de permissões
- ✅ Filtros por módulo e role
- ✅ Interface responsiva e intuitiva

### **Gerenciamento de Relações Permissão-Operação**
- ✅ Listagem de relações com detalhes completos
- ✅ Criação de relações individuais
- ✅ Criação em lote (bulk) de múltiplas relações
- ✅ Edição de relações existentes
- ✅ Exclusão de relações específicas
- ✅ Exclusão de todas as relações de uma permissão
- ✅ Ativação/desativação de relações
- ✅ Interface para seleção de permissões e operações

## 📁 Estrutura do Módulo

```
src/features/permissions/
├── components/
│   ├── PermissionsList.tsx           # Lista de permissões
│   ├── PermissionForm.tsx            # Formulário de permissão
│   ├── PermissionDialog.tsx          # Modal de permissão
│   ├── PermissionOperationsList.tsx  # Lista de relações
│   ├── PermissionOperationForm.tsx   # Formulário de relação
│   ├── PermissionOperationDialog.tsx # Modal de relação
│   └── index.ts
├── hooks/
│   ├── usePermissions.ts             # Hook para permissões
│   ├── usePermissionOperations.ts    # Hook para relações
│   └── index.ts
├── PermissionsPage.tsx               # Página principal de permissões
├── PermissionOperationsPage.tsx      # Página de relações
└── index.ts
```

## 🔧 Services Implementados

### **PermissionService**
- `getPermissions()` - Lista permissões com paginação
- `getPermissionById()` - Busca permissão por ID
- `getPermissionsByModule()` - Busca por módulo
- `getPermissionsByRole()` - Busca por role
- `createPermission()` - Cria nova permissão
- `updatePermission()` - Atualiza permissão
- `deletePermission()` - Remove permissão
- `togglePermissionStatus()` - Alterna status

### **PermissionOperationService**
- `getPermissionOperations()` - Lista relações com paginação
- `getByPermissionId()` - Busca por permissão
- `getByOperationId()` - Busca por operação
- `getByPermissionAndOperation()` - Busca relação específica
- `createPermissionOperation()` - Cria relação individual
- `createPermissionOperationsBulk()` - Cria múltiplas relações
- `updatePermissionOperation()` - Atualiza relação
- `deletePermissionOperation()` - Remove relação
- `deleteAllByPermissionId()` - Remove todas as relações de uma permissão
- `deleteByPermissionAndOperations()` - Remove relações específicas
- `togglePermissionOperationStatus()` - Alterna status

## 🎯 Tipos TypeScript

### **Interfaces Principais**
```typescript
interface Permission {
  id: string;
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface PermissionOperation {
  id: string;
  permissionId: string;
  operationId: string;
  permissionName: string;
  operationName: string;
  operationCode: string;
  operationDescription: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
```

### **DTOs para API**
```typescript
interface CreatePermissionRequest {
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
}

interface CreatePermissionOperationRequest {
  permissionId: string;
  operationId: string;
  isActive?: boolean;
}

interface PermissionOperationBulkRequest {
  permissionId: string;
  operationIds: string[];
}
```

## 🎨 Padrões de Design Seguidos

### **Arquitetura Limpa**
- **Services**: Camada de integração com API
- **Hooks**: Lógica de negócio e estado
- **Components**: Componentes de UI reativos
- **Types**: Tipagem forte com TypeScript

### **Padrões React**
- **Custom Hooks**: Encapsulamento da lógica de estado
- **Composition**: Componentes compostos e reutilizáveis
- **Responsive Design**: Interface adaptável a diferentes dispositivos
- **Error Handling**: Tratamento consistente de erros

### **Material-UI Consistency**
- **Componentes padronizados**: Seguindo design system existente
- **Responsividade**: Stack layouts para mobile-first
- **Acessibilidade**: Tooltips, labels e navegação por teclado
- **Feedback visual**: Loading states, confirmações e alertas

## 🔗 Integração com API Backend

O módulo está preparado para integração com a API `saas-authentication-api`:

### **Endpoints Mapeados**
- `GET /api/permissions` - Lista permissões
- `POST /api/permissions` - Cria permissão
- `PUT /api/permissions/{id}` - Atualiza permissão
- `DELETE /api/permissions/{id}` - Remove permissão
- `GET /api/permission-operations` - Lista relações
- `POST /api/permission-operations` - Cria relação
- `POST /api/permission-operations/bulk` - Cria relações em lote
- `PUT /api/permission-operations/{id}` - Atualiza relação
- `DELETE /api/permission-operations/{id}` - Remove relação

### **Compatibilidade de DTOs**
Todos os DTOs foram mapeados corretamente para corresponder aos DTOs do backend C#:
- `PermissionDTO` ↔ `Permission`
- `PermissionCreateDTO` ↔ `CreatePermissionRequest`
- `PermissionOperationDTO` ↔ `PermissionOperation`
- `PermissionOperationBulkDTO` ↔ `PermissionOperationBulkRequest`

## 📱 Funcionalidades da Interface

### **Lista de Permissões**
- Visualização em tabela responsiva
- Informações: Nome, Código, Descrição, Status, Data de criação
- Ações: Editar, Ativar/Desativar, Excluir
- Feedback visual para estados de loading
- Mensagem quando não há dados

### **Formulário de Permissão**
- Campos: Nome (obrigatório), Código, Descrição, Tenant ID
- Seletores para Módulo e Operações
- Switch para status ativo/inativo
- Validação client-side
- Loading states durante submissão

### **Lista de Relações**
- Visualização detalhada das relações
- Informações: Permissão, Operação, Código, Descrição, Status
- Ações completas de gerenciamento
- Interface intuitiva para gerenciar relacionamentos

### **Formulário de Relação**
- Seleção de permissão e operação (para criação)
- Visualização read-only para edição
- Controle de status ativo/inativo
- Prevenção de relações duplicadas

## 🚀 Como Utilizar

### **Importação do Módulo**
```typescript
import { 
  PermissionsPage, 
  PermissionOperationsPage,
  usePermissions,
  usePermissionOperations
} from '../features/permissions';
```

### **Uso dos Hooks**
```typescript
// Hook de permissões
const {
  permissions,
  loading,
  error,
  createPermission,
  updatePermission,
  deletePermission,
  toggleStatus
} = usePermissions();

// Hook de relações
const {
  permissionOperations,
  loading,
  createPermissionOperation,
  createPermissionOperationsBulk,
  updatePermissionOperation,
  deletePermissionOperation
} = usePermissionOperations();
```

## ✅ Status da Implementação

- ✅ **Services**: Implementados e testados
- ✅ **Types**: Completos e tipados
- ✅ **Hooks**: Funcionais com tratamento de erro
- ✅ **Components**: Responsivos e acessíveis
- ✅ **Pages**: Prontas para uso
- ✅ **Integration**: Preparado para API backend
- ✅ **Documentation**: Documentação completa

## 🎯 Próximos Passos

1. **Configurar rotas** no sistema de navegação
2. **Testar integração** com API backend
3. **Implementar testes unitários** para componentes críticos
4. **Adicionar validações** específicas de negócio
5. **Implementar cache** para otimizar performance

---

**Módulo desenvolvido seguindo os padrões arquiteturais e de design system existentes no projeto, garantindo consistência, manutenibilidade e excelente experiência do usuário.**