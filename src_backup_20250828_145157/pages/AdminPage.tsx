import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { UserForm } from '../components/UserForm';
import { DashboardForm } from '../components/DashboardForm';
import { AssociationTab } from '../components/AssociationTab';
import { authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  nome: string;
  email: string;
  role: string;
}

interface Dashboard {
  id: number;
  nome: string;
  classe: string;
  url: string;
}

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'dashboards' | 'associations'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'dashboards') {
      loadDashboards();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadDashboards = async () => {
    try {
      const response = await authAPI.getDashboards();
      setDashboards(response.dashboards || []);
    } catch (error) {
      console.error('Erro ao carregar dashboards:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <p className="mt-2 text-gray-600">Gerencie usuários, dashboards e permissões da plataforma</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Usuários ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('dashboards')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboards'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboards ({dashboards.length})
              </button>
              <button
                onClick={() => setActiveTab('associations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'associations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Associações
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + Novo Usuário
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">USUÁRIO</th>
                        <th className="text-left py-2">CONTATO</th>
                        <th className="text-left py-2">FUNÇÃO</th>
                        <th className="text-left py-2">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b">
                          <td className="py-2">{user.nome}</td>
                          <td className="py-2">{user.email}</td>
                          <td className="py-2">{user.role}</td>
                          <td className="py-2">
                            <button className="text-red-600 hover:text-red-800">
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'dashboards' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Gerenciamento de Dashboards</h2>
                  <button
                    onClick={() => setShowDashboardModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + Novo Dashboard
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">NOME</th>
                        <th className="text-left py-2">CLASSE</th>
                        <th className="text-left py-2">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboards.map(dashboard => (
                        <tr key={dashboard.id} className="border-b">
                          <td className="py-2">{dashboard.nome}</td>
                          <td className="py-2">{dashboard.classe}</td>
                          <td className="py-2">
                            <button className="text-red-600 hover:text-red-800">
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dashboards.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum dashboard encontrado
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'associations' && <AssociationTab />}
          </div>
        </div>

        {showUserModal && (
          <UserForm
            onClose={() => setShowUserModal(false)}
            onSuccess={() => {
              setShowUserModal(false);
              loadUsers();
            }}
          />
        )}

        {showDashboardModal && (
          <DashboardForm
            onClose={() => setShowDashboardModal(false)}
            onSuccess={() => {
              setShowDashboardModal(false);
              loadDashboards();
            }}
          />
        )}
      </div>
    </div>
  );
};
