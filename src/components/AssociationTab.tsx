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

export const AssociationTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>(0);
  const [selectedDashboard, setSelectedDashboard] = useState<number>(0);
  const [userDashboards, setUserDashboards] = useState<{[key: number]: Dashboard[]}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, dashboardsRes] = await Promise.all([
        authAPI.getUsers(),
        authAPI.getDashboards()
      ]);
      
      setUsers(usersRes.users || []);
      setDashboards(dashboardsRes.dashboards || []);
      
      // Carregar associações existentes
      const associations: {[key: number]: Dashboard[]} = {};
      for (const user of usersRes.users || []) {
        try {
          const userDashRes = await authAPI.getUserAssignments(user.id);
          associations[user.id] = userDashRes.dashboards || [];
        } catch (error) {
          associations[user.id] = [];
        }
      }
      setUserDashboards(associations);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedDashboard) {
      alert('Selecione um usuário e um dashboard');
      return;
    }

    try {
      await authAPI.assignDashboard(selectedUser, selectedDashboard);
      alert('Associação criada com sucesso!');
      loadData();
      setSelectedUser(0);
      setSelectedDashboard(0);
    } catch (error) {
      alert('Erro ao criar associação: ' + (error as Error).message);
    }
  };

  const handleUnassign = async (userId: number, dashboardId: number) => {
    if (!confirm('Remover esta associação?')) return;

    try {
      await authAPI.unassignDashboard(userId, dashboardId);
      alert('Associação removida com sucesso!');
      loadData();
    } catch (error) {
      alert('Erro ao remover associação: ' + (error as Error).message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Criar Nova Associação */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Nova Associação</h3>
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
            onClick={handleAssign}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Associar
          </button>
        </div>
      </div>

      {/* Lista de Associações */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Associações Existentes</h3>
        {users.map(user => (
          <div key={user.id} className="mb-4 border-b pb-4">
            <h4 className="font-medium text-gray-900">{user.nome}</h4>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2">
              {userDashboards[user.id]?.length > 0 ? (
                <div className="space-y-1">
                  {userDashboards[user.id].map(dashboard => (
                    <div key={dashboard.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span>{dashboard.nome} ({dashboard.classe})</span>
                      <button
                        onClick={() => handleUnassign(user.id, dashboard.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">Nenhum dashboard associado</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
