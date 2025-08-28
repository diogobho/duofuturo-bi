import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Users, BarChart3, Plus, X, Check } from 'lucide-react';

interface User {
  id: number;
  nome: string;
  email: string;
  username: string;
  role: string;
}

interface Dashboard {
  id: number;
  nome: string;
  classe: string;
  descricao?: string;
}

export const SmartAssociationManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>(0);
  const [selectedDashboard, setSelectedDashboard] = useState<number>(0);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedDashboards, setSelectedDashboards] = useState<number[]>([]);
  const [mode, setMode] = useState<'single' | 'multiple-dash' | 'multiple-users'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<{users: User[], dashboards: Dashboard[]}>({users: [], dashboards: []});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [usersRes, dashboardsRes] = await Promise.all([
        authAPI.getUsers(),
        authAPI.getDashboards()
      ]);
      setUsers(usersRes.users || []);
      setDashboards(dashboardsRes.dashboards || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadAvailableOptions = async () => {
    try {
      if (mode === 'multiple-dash' && selectedUser) {
        const result = await authAPI.getDashboardsNotAssignedToUser(selectedUser);
        setAvailableOptions({users: [], dashboards: result.dashboards || []});
      } else if (mode === 'multiple-users' && selectedDashboard) {
        const result = await authAPI.getUsersWithoutDashboard(selectedDashboard);
        setAvailableOptions({users: result.users || [], dashboards: []});
      }
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    }
  };

  useEffect(() => {
    if (mode !== 'single') {
      loadAvailableOptions();
    }
  }, [mode, selectedUser, selectedDashboard]);

  const handleSingleAssociation = async () => {
    if (!selectedUser || !selectedDashboard) {
      alert('Selecione um usuário e um dashboard');
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.unassignDashboard(selectedUser, selectedDashboard);
      alert('Associação criada com sucesso!');
      resetForm();
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
    } catch (error: any) {
      alert('Erro ao associar usuários: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(0);
    setSelectedDashboard(0);
    setSelectedUsers([]);
    setSelectedDashboards([]);
    setAvailableOptions({users: [], dashboards: []});
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Gerenciamento Inteligente de Associações</h3>
        
        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tipo de Associação</label>
          <div className="flex space-x-4">
            <button
              onClick={() => { setMode('single'); resetForm(); }}
              className={`px-4 py-2 rounded-lg ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              1 para 1
            </button>
            <button
              onClick={() => { setMode('multiple-dash'); resetForm(); }}
              className={`px-4 py-2 rounded-lg ${mode === 'multiple-dash' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Múltiplos Dashboards para 1 Usuário
            </button>
            <button
              onClick={() => { setMode('multiple-users'); resetForm(); }}
              className={`px-4 py-2 rounded-lg ${mode === 'multiple-users' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              1 Dashboard para Múltiplos Usuários
            </button>
          </div>
        </div>

        {/* Single Association */}
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
              onClick={handleSingleAssociation}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Associando...' : 'Associar'}
            </button>
          </div>
        )}

        {/* Multiple Dashboards to One User */}
        {mode === 'multiple-dash' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Selecionar Usuário</label>
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

            {selectedUser > 0 && availableOptions.dashboards.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecionar Dashboards Disponíveis ({selectedDashboards.length} selecionados)
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {availableOptions.dashboards.map(dashboard => (
                    <label key={dashboard.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedDashboards.includes(dashboard.id)}
                        onChange={() => toggleDashboardSelection(dashboard.id)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div>
                        <span className="font-medium">{dashboard.nome}</span>
                        <span className="text-sm text-gray-500 ml-2">({dashboard.classe})</span>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleMultipleDashboardsAssociation}
                  disabled={isLoading || selectedDashboards.length === 0}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Associando...' : `Associar ${selectedDashboards.length} Dashboards`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* One Dashboard to Multiple Users */}
        {mode === 'multiple-users' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Selecionar Dashboard</label>
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

            {selectedDashboard > 0 && availableOptions.users.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecionar Usuários Disponíveis ({selectedUsers.length} selecionados)
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {availableOptions.users.map(user => (
                    <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div>
                        <span className="font-medium">{user.nome}</span>
                        <span className="text-sm text-gray-500 ml-2">({user.email})</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">{user.role}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleMultipleUsersAssociation}
                  disabled={isLoading || selectedUsers.length === 0}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Associando...' : `Associar a ${selectedUsers.length} Usuários`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
