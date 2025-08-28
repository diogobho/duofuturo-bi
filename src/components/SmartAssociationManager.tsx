import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

interface Dashboard {
  id: number;
  nome: string;
  classe: string;
}

interface Assignment {
  id: number;
  user_id: number;
  dashboard_id: number;
  user_name: string;
  user_email: string;
  dashboard_name: string;
  dashboard_class: string;
  assigned_at: string;
}

type AssociationMode = 'single' | 'multiple-dash' | 'multiple-users';

export const SmartAssociationManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mode, setMode] = useState<AssociationMode>('single');
  const [isLoading, setIsLoading] = useState(false);

  // Single mode states
  const [selectedUser, setSelectedUser] = useState<number>(0);
  const [selectedDashboard, setSelectedDashboard] = useState<number>(0);

  // Multiple mode states
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedDashboards, setSelectedDashboards] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, dashboardsRes, assignmentsRes] = await Promise.all([
        authAPI.getUsers(),
        authAPI.getDashboards(),
        authAPI.getAllAssignments()
      ]);
      
      setUsers(usersRes.users || []);
      setDashboards(dashboardsRes.dashboards || []);
      setAssignments(assignmentsRes.assignments || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleAssociation = async () => {
    if (!selectedUser || !selectedDashboard) {
      alert('Selecione um usuário e um dashboard');
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.assignDashboard(selectedUser, selectedDashboard);
      alert('Associação criada com sucesso!');
      resetForm();
      loadData();
    } catch (error: any) {
      alert('Erro ao criar associação: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultipleDashboardsAssociation = async () => {
    if (!selectedUser || selectedDashboards.length === 0) {
      alert('Selecione um usuário e pelo menos um dashboard');
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.assignMultipleDashboards(selectedUser, selectedDashboards);
      alert(`${selectedDashboards.length} dashboards associados com sucesso!`);
      resetForm();
      loadData();
    } catch (error: any) {
      alert('Erro ao associar dashboards: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultipleUsersAssociation = async () => {
    if (!selectedDashboard || selectedUsers.length === 0) {
      alert('Selecione um dashboard e pelo menos um usuário');
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.assignDashboardToMultipleUsers(selectedDashboard, selectedUsers);
      alert(`Dashboard associado a ${selectedUsers.length} usuários com sucesso!`);
      resetForm();
      loadData();
    } catch (error: any) {
      alert('Erro ao associar usuários: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassign = async (userId: number, dashboardId: number) => {
    if (!confirm('Remover esta associação?')) return;

    try {
      await authAPI.unassignDashboard(userId, dashboardId);
      alert('Associação removida com sucesso!');
      loadData();
    } catch (error: any) {
      alert('Erro ao remover associação: ' + error.message);
    }
  };

  const resetForm = () => {
    setSelectedUser(0);
    setSelectedDashboard(0);
    setSelectedUsers([]);
    setSelectedDashboards([]);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleDashboardSelection = (dashboardId: number) => {
    setSelectedDashboards(prev => 
      prev.includes(dashboardId) 
        ? prev.filter(id => id !== dashboardId)
        : [...prev, dashboardId]
    );
  };

  const executeAssociation = () => {
    switch (mode) {
      case 'single':
        handleSingleAssociation();
        break;
      case 'multiple-dash':
        handleMultipleDashboardsAssociation();
        break;
      case 'multiple-users':
        handleMultipleUsersAssociation();
        break;
    }
  };

  if (isLoading && assignments.length === 0) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Gerenciamento de Associações</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Usuários</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dashboards.length}</div>
            <div className="text-sm text-gray-600">Dashboards</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{assignments.length}</div>
            <div className="text-sm text-gray-600">Associações Ativas</div>
          </div>
        </div>
      </div>

      {/* Seletor de modo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tipo de Associação</h3>
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => { setMode('single'); resetForm(); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'single' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 para 1
          </button>
          <button
            onClick={() => { setMode('multiple-dash'); resetForm(); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'multiple-dash' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 Usuário → Múltiplos Dashboards
          </button>
          <button
            onClick={() => { setMode('multiple-users'); resetForm(); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'multiple-users' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 Dashboard → Múltiplos Usuários
          </button>
        </div>

        {/* Formulários baseados no modo */}
        {mode === 'single' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(Number(e.target.value))}
              className="border rounded-lg px-3 py-2"
            >
              <option value={0}>Selecione um usuário</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nome} ({user.email})
                </option>
              ))}
            </select>
            
            <select
              value={selectedDashboard}
              onChange={(e) => setSelectedDashboard(Number(e.target.value))}
              className="border rounded-lg px-3 py-2"
            >
              <option value={0}>Selecione um dashboard</option>
              {dashboards.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.nome} ({dashboard.classe})
                </option>
              ))}
            </select>
            
            <button
              onClick={executeAssociation}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Associando...' : 'Associar'}
            </button>
          </div>
        )}

        {mode === 'multiple-dash' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Selecione o Usuário</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={0}>Selecione um usuário</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nome} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Selecione os Dashboards ({selectedDashboards.length} selecionados)
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {dashboards.map(dashboard => (
                  <label key={dashboard.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedDashboards.includes(dashboard.id)}
                      onChange={() => toggleDashboardSelection(dashboard.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {dashboard.nome} <span className="text-gray-500">({dashboard.classe})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              onClick={executeAssociation}
              disabled={isLoading || !selectedUser || selectedDashboards.length === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Associando...' : `Associar ${selectedDashboards.length} Dashboards`}
            </button>
          </div>
        )}

        {mode === 'multiple-users' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Selecione o Dashboard</label>
              <select
                value={selectedDashboard}
                onChange={(e) => setSelectedDashboard(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={0}>Selecione um dashboard</option>
                {dashboards.map(dashboard => (
                  <option key={dashboard.id} value={dashboard.id}>
                    {dashboard.nome} ({dashboard.classe})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Selecione os Usuários ({selectedUsers.length} selecionados)
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {users.map(user => (
                  <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {user.nome} <span className="text-gray-500">({user.email})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              onClick={executeAssociation}
              disabled={isLoading || !selectedDashboard || selectedUsers.length === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Associando...' : `Associar a ${selectedUsers.length} Usuários`}
            </button>
          </div>
        )}
      </div>

      {/* Lista de Associações */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Associações Existentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Usuário</th>
                <th className="text-left py-2 px-2">Email</th>
                <th className="text-left py-2 px-2">Dashboard</th>
                <th className="text-left py-2 px-2">Classe</th>
                <th className="text-left py-2 px-2">Data</th>
                <th className="text-left py-2 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={`${assignment.user_id}-${assignment.dashboard_id}`} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">{assignment.user_name}</td>
                  <td className="py-2 px-2 text-gray-600">{assignment.user_email}</td>
                  <td className="py-2 px-2">{assignment.dashboard_name}</td>
                  <td className="py-2 px-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {assignment.dashboard_class}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-gray-600">
                    {new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleUnassign(assignment.user_id, assignment.dashboard_id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma associação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
