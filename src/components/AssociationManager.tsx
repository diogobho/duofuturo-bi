import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { showToast } from './Toaster';

interface User {
  id: number;
  nome: string;
  email: string;
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

export const AssociationManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>(0);
  const [selectedDashboard, setSelectedDashboard] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

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
      
      setUsers(usersRes.users);
      setDashboards(dashboardsRes.dashboards);
      setAssignments(assignmentsRes.assignments);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao carregar dados',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedDashboard) {
      showToast({
        type: 'error',
        title: 'Selecione um usuário e um dashboard'
      });
      return;
    }

    try {
      await authAPI.assignDashboard(selectedUser, selectedDashboard);
      showToast({
        type: 'success',
        title: 'Associação criada com sucesso!'
      });
      loadData();
      setSelectedUser(0);
      setSelectedDashboard(0);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao criar associação',
        message: error.message
      });
    }
  };

  const handleUnassign = async (userId: number, dashboardId: number) => {
    try {
      await authAPI.unassignDashboard(userId, dashboardId);
      showToast({
        type: 'success',
        title: 'Associação removida com sucesso!'
      });
      loadData();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao remover associação',
        message: error.message
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Associações Existentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Usuário</th>
                <th className="text-left py-2">Dashboard</th>
                <th className="text-left py-2">Classe</th>
                <th className="text-left py-2">Data</th>
                <th className="text-left py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id} className="border-b">
                  <td className="py-2">
                    {assignment.user_name}
                    <div className="text-gray-500 text-xs">{assignment.user_email}</div>
                  </td>
                  <td className="py-2">{assignment.dashboard_name}</td>
                  <td className="py-2">{assignment.dashboard_class}</td>
                  <td className="py-2">
                    {new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleUnassign(assignment.user_id, assignment.dashboard_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma associação encontrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
