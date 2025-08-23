import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { authAPI } from '../services/api';
import { showToast } from '../components/Toaster';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  nome: string;
  email: string;
  data_nascimento: string;
  endereco: string;
  role: 'viewer' | 'creator';
  dashboard_count: number;
  created_at: string;
}

interface Dashboard {
  id: number;
  classe: string;
  nome: string;
  iframe: string;
  link: string;
  link_mobile: string;
  has_access?: boolean;
}

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'dashboards'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadDashboards();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getUsers();
      setUsers(response.users);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao carregar usuários',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboards = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getDashboards();
      setDashboards(response.dashboards);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao carregar dashboards',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      await authAPI.deleteUser(userId);
      showToast({
        type: 'success',
        title: 'Usuário excluído com sucesso!'
      });
      loadUsers();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao excluir usuário',
        message: error.message
      });
    }
  };

  const deleteDashboard = async (dashboardId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este dashboard?')) {
      return;
    }

    try {
      await authAPI.deleteDashboard(dashboardId);
      showToast({
        type: 'success',
        title: 'Dashboard excluído com sucesso!'
      });
      loadDashboards();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao excluir dashboard',
        message: error.message
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleBadge = (role: string) => {
    return role === 'creator' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <Shield className="w-3 h-3 mr-1" />
        Creator
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Users className="w-3 h-3 mr-1" />
        Viewer
      </span>
    );
  };

  if (isLoading && (users.length === 0 && dashboards.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administração
          </h1>
          <p className="text-gray-600">
            Gerencie usuários, dashboards e permissões da plataforma
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Users className="w-4 h-4 mr-2" />
                Usuários ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('dashboards')}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'dashboards'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboards ({dashboards.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow-md rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Gerenciamento de Usuários
              </h2>
              <button
                onClick={() => setShowUserModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dashboards
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.nome.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(user.data_nascimento)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {user.dashboard_count} dashboard{user.dashboard_count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhum usuário encontrado</p>
                <p>Comece criando o primeiro usuário</p>
              </div>
            )}
          </div>
        )}

        {/* Dashboards Tab */}
        {activeTab === 'dashboards' && (
          <div className="bg-white shadow-md rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Gerenciamento de Dashboards
              </h2>
              <button
                onClick={() => setShowDashboardModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Dashboard
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {dashboard.nome}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {dashboard.classe}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          // Handle edit dashboard
                          console.log('Edit dashboard:', dashboard.id);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDashboard(dashboard.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Desktop:</span>
                      <a
                        href={dashboard.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-2 truncate block"
                      >
                        {dashboard.link}
                      </a>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Mobile:</span>
                      <a
                        href={dashboard.link_mobile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-2 truncate block"
                      >
                        {dashboard.link_mobile}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {dashboards.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhum dashboard encontrado</p>
                <p>Comece adicionando o primeiro dashboard</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals would go here - simplified for now */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade de formulário será implementada aqui
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDashboardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Novo Dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade de formulário será implementada aqui
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDashboardModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};