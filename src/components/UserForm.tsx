import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { authAPI } from '../services/api';
import { showToast } from './Toaster';

interface UserFormData {
  username: string;
  password: string;
  nome: string;
  email: string;
  data_nascimento: string;
  endereco: string;
  role: 'viewer' | 'creator';
}

interface UserFormProps {
  user?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    nome: '',
    email: '',
    data_nascimento: '',
    endereco: '',
    role: 'viewer'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        password: '',
        nome: user.nome || '',
        email: user.email || '',
        data_nascimento: user.data_nascimento?.split('T')[0] || '',
        endereco: user.endereco || '',
        role: user.role || 'viewer'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (user) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await authAPI.updateUser(user.id, updateData);
        showToast({
          type: 'success',
          title: 'Usuário atualizado com sucesso!'
        });
      } else {
        await authAPI.createUser(formData);
        showToast({
          type: 'success',
          title: 'Usuário criado com sucesso!'
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: user ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {user ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de usuário
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome de usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {user ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!user}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={user ? "Digite nova senha (opcional)" : "Digite a senha"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de nascimento
              </label>
              <input
                type="date"
                name="data_nascimento"
                value={formData.data_nascimento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o endereço"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="viewer">Viewer (Visualizador)</option>
                <option value="creator">Creator (Criador)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Salvando...' : (user ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};