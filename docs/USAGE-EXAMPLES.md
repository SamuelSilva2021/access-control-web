# Exemplos de Uso - Sistema de Controle de Acesso Baseado em Módulos

## Visão Geral

Este documento apresenta exemplos práticos de como usar o novo sistema de controle de acesso baseado em módulos no projeto Access Control Web.

## 1. Proteção de Rotas

### Exemplo: Página de Usuários

```tsx
// src/features/users/UsersPage.tsx
import React from 'react';
import { ProtectedRoute, AccessDenied } from '../../shared/components';
import { ModuleKey } from '../../shared/types/permission.types';

export const UsersPage: React.FC = () => {
  return (
    <ProtectedRoute 
      moduleKey={ModuleKey.USER_MODULE} 
      operation="SELECT"
      fallback={<AccessDenied message="Você não tem permissão para visualizar usuários." />}
    >
      <div>
        <h1>Lista de Usuários</h1>
        {/* Conteúdo da página */}
      </div>
    </ProtectedRoute>
  );
};
```

### Exemplo: Formulário de Criação

```tsx
// src/features/users/CreateUserPage.tsx
import React from 'react';
import { ProtectedRoute, AccessDenied } from '../../shared/components';
import { ModuleKey } from '../../shared/types/permission.types';

export const CreateUserPage: React.FC = () => {
  return (
    <ProtectedRoute 
      moduleKey={ModuleKey.USER_MODULE} 
      operation="CREATE"
      fallback={<AccessDenied message="Você não tem permissão para criar usuários." />}
    >
      <div>
        <h1>Criar Usuário</h1>
        {/* Formulário de criação */}
      </div>
    </ProtectedRoute>
  );
};
```

## 2. Proteção de Componentes

### Exemplo: Botões de Ação

```tsx
// src/features/users/components/UserActions.tsx
import React from 'react';
import { ProtectedComponent } from '../../../shared/components';
import { usePermissions } from '../../../shared/stores';
import { ModuleKey } from '../../../shared/types/permission.types';

interface UserActionsProps {
  userId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const UserActions: React.FC<UserActionsProps> = ({ userId, onEdit, onDelete }) => {
  const { canUpdate, canDelete } = usePermissions();

  return (
    <div className="flex gap-2">
      <ProtectedComponent moduleKey={ModuleKey.USER_MODULE} operation="UPDATE">
        <button 
          onClick={() => onEdit(userId)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar
        </button>
      </ProtectedComponent>

      <ProtectedComponent moduleKey={ModuleKey.USER_MODULE} operation="DELETE">
        <button 
          onClick={() => onDelete(userId)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Excluir
        </button>
      </ProtectedComponent>

      {/* Ou usando hooks diretamente */}
      {canUpdate(ModuleKey.USER_MODULE) && (
        <button className="px-3 py-1 bg-green-500 text-white rounded">
          Ativar
        </button>
      )}

      {canDelete(ModuleKey.USER_MODULE) && (
        <button className="px-3 py-1 bg-gray-500 text-white rounded">
          Desativar
        </button>
      )}
    </div>
  );
};
```

## 3. Menu Dinâmico

### Implementação no Layout Principal

```tsx
// src/shared/components/layout/MainLayout.tsx
import React from 'react';
import { DynamicMenu } from '../Menu';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Access Control</h2>
        </div>
        <DynamicMenu className="px-4" />
      </aside>
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
```

## 4. Hook de Permissões

### Uso em Componentes

```tsx
// src/features/orders/OrdersPage.tsx
import React, { useEffect, useState } from 'react';
import { usePermissions } from '../../shared/stores';
import { ModuleKey } from '../../shared/types/permission.types';

export const OrdersPage: React.FC = () => {
  const { hasAccess, canCreate, canUpdate, canDelete, getAccessibleModules } = usePermissions();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Verificar se pode visualizar pedidos
    if (!hasAccess(ModuleKey.ORDER_MODULE, 'SELECT')) {
      console.log('Usuário sem permissão para visualizar pedidos');
      return;
    }

    // Carregar pedidos apenas se tiver permissão
    loadOrders();
  }, [hasAccess]);

  const loadOrders = async () => {
    // Lógica de carregamento
  };

  const handleCreateOrder = () => {
    if (canCreate(ModuleKey.ORDER_MODULE)) {
      // Lógica de criação
      console.log('Criando pedido...');
    } else {
      alert('Você não tem permissão para criar pedidos');
    }
  };

  const handleUpdateOrder = (orderId: string) => {
    if (canUpdate(ModuleKey.ORDER_MODULE)) {
      // Lógica de atualização
      console.log('Atualizando pedido:', orderId);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (canDelete(ModuleKey.ORDER_MODULE)) {
      // Lógica de exclusão
      console.log('Excluindo pedido:', orderId);
    }
  };

  // Verificar se tem acesso antes de renderizar
  if (!hasAccess(ModuleKey.ORDER_MODULE, 'SELECT')) {
    return (
      <div className="p-8 text-center">
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para visualizar pedidos.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        
        {canCreate(ModuleKey.ORDER_MODULE) && (
          <button 
            onClick={handleCreateOrder}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Novo Pedido
          </button>
        )}
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => (
          <div key={order.id} className="border p-4 rounded">
            <h3>Pedido #{order.id}</h3>
            <div className="flex gap-2 mt-2">
              {canUpdate(ModuleKey.ORDER_MODULE) && (
                <button 
                  onClick={() => handleUpdateOrder(order.id)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  Editar
                </button>
              )}
              
              {canDelete(ModuleKey.ORDER_MODULE) && (
                <button 
                  onClick={() => handleDeleteOrder(order.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 5. Roteamento Dinâmico

### Configuração de Rotas Baseada em Permissões

```tsx
// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, usePermissions } from './shared/stores';
import { MainLayout } from './shared/components';
import { LoginPage } from './features/auth';
import { ModuleKey } from './shared/types/permission.types';

// Páginas
import { DashboardPage } from './features/dashboard';
import { UsersPage } from './features/users';
import { OrdersPage } from './features/orders';
import { AccessGroupsPage } from './features/access-groups';

export const App: React.FC = () => {
  const { isAuthenticated, initialize } = useAuthStore();
  const { hasAccess } = usePermissions();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Rota de usuários - só aparece se tiver permissão */}
          {hasAccess(ModuleKey.USER_MODULE, 'SELECT') && (
            <Route path="/users/*" element={<UsersPage />} />
          )}
          
          {/* Rota de pedidos */}
          {hasAccess(ModuleKey.ORDER_MODULE, 'SELECT') && (
            <Route path="/orders/*" element={<OrdersPage />} />
          )}
          
          {/* Rota de controle de acesso */}
          {hasAccess(ModuleKey.ACCESS_GROUP, 'SELECT') && (
            <Route path="/access-groups/*" element={<AccessGroupsPage />} />
          )}
          
          {/* Rota de fallback */}
          <Route path="*" element={
            <div className="p-8 text-center">
              <h2>Página não encontrada</h2>
              <p>A página que você está procurando não existe ou você não tem permissão para acessá-la.</p>
            </div>
          } />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};
```

## 6. Tratamento de Permissões em Formulários

### Campos Condicionais

```tsx
// src/features/users/components/UserForm.tsx
import React from 'react';
import { usePermissions } from '../../../shared/stores';
import { ModuleKey } from '../../../shared/types/permission.types';

interface UserFormProps {
  user?: any;
  onSave: (data: any) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSave }) => {
  const { canUpdate, hasAccess } = usePermissions();
  const isEditing = !!user;

  return (
    <form onSubmit={(e) => { e.preventDefault(); /* lógica de save */ }}>
      <div className="space-y-4">
        <div>
          <label>Nome</label>
          <input 
            type="text" 
            defaultValue={user?.name}
            disabled={isEditing && !canUpdate(ModuleKey.USER_MODULE)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Email</label>
          <input 
            type="email" 
            defaultValue={user?.email}
            disabled={isEditing && !canUpdate(ModuleKey.USER_MODULE)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Campo sensível - só aparece se tiver permissão de controle de acesso */}
        {hasAccess(ModuleKey.ACCESS_GROUP, 'SELECT') && (
          <div>
            <label>Grupos de Acesso</label>
            <select 
              multiple 
              disabled={!hasAccess(ModuleKey.ACCESS_GROUP, 'UPDATE')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="admin">Administrador</option>
              <option value="user">Usuário</option>
            </select>
          </div>
        )}

        <div className="flex gap-2">
          {(!isEditing || canUpdate(ModuleKey.USER_MODULE)) && (
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditing ? 'Atualizar' : 'Criar'}
            </button>
          )}
          
          <button 
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
};
```

## 7. Debug e Desenvolvimento

### Componente de Debug de Permissões

```tsx
// src/shared/components/Debug/PermissionsDebug.tsx (apenas para desenvolvimento)
import React from 'react';
import { usePermissions } from '../../stores';
import { ModuleKey } from '../../types/permission.types';

export const PermissionsDebug: React.FC = () => {
  const { getAccessibleModules, getModuleOperations } = usePermissions();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const accessibleModules = getAccessibleModules();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded max-w-sm">
      <h3 className="font-bold mb-2">Debug - Permissões</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Módulos Acessíveis:</strong>
          <ul className="ml-2">
            {accessibleModules.map(module => (
              <li key={module}>
                {module}: [{getModuleOperations(module).join(', ')}]
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
```

## Benefícios da Implementação

1. **Segurança**: Componentes sem permissão não são renderizados
2. **Performance**: Menos código desnecessário no DOM
3. **UX**: Interface limpa e intuitiva
4. **Manutenibilidade**: Sistema centralizado e declarativo
5. **Flexibilidade**: Fácil adição de novos módulos

## Próximos Passos

1. Implementar os exemplos acima gradualmente
2. Migrar rotas existentes para usar ProtectedRoute
3. Atualizar menus para usar DynamicMenu
4. Adicionar testes para os componentes de proteção
5. Documentar novos módulos conforme adicionados