import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { authAPI } from '../services/api';
import { showToast } from './Toaster';

interface DashboardFormData {
  classe: string;
  nome: string;
  iframe: string;
  link: string;
  link_mobile: string;
}

interface DashboardFormProps {
  dashboard?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const DashboardForm: React.FC<DashboardFormProps> = ({ dashboard, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<DashboardFormData>({
    classe: '',
    nome: '',
    iframe: '',
    link: '',
    link_mobile: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (dashboard) {
      setFormData({
        classe: dashboard.classe || '',
        nome: dashboard.nome || '',
        iframe: dashboard.iframe || '',
        link: dashboard.link || '',
        link_mobile: dashboard.link_mobile || ''
      });
    }
  }, [dashboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (dashboard) {
        await authAPI.updateDashboard(dashboard.id, formData);
        showToast({
          type: 'success',
          title: 'Dashboard atualizado com sucesso!'
        });
      } else {
        await authAPI.createDashboard(formData);
        showToast({
          type: 'success',
          title: 'Dashboard criado com sucesso!'
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: dashboard ? 'Erro ao atualizar dashboard' : 'Erro ao criar dashboard',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'link' && value) {
      setFormData(prev => ({
        ...prev,
        iframe: value,
        link_mobile: prev.link_mobile || value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {dashboard ? 'Editar Dashboard' : 'Novo Dashboard'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe/Categoria
              </label>
              <input
                type="text"
                name="classe"
                value={formData.classe}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Mercado Financeiro, Brand Analysis..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Dashboard
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome do dashboard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Principal (Desktop)
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://tableau.com/dashboard..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link do iFrame
              </label>
              <input
                type="url"
                name="iframe"
                value={formData.iframe}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://tableau.com/dashboard..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Normalmente igual ao link principal
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Mobile
              </label>
              <input
                type="url"
                name="link_mobile"
                value={formData.link_mobile}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://tableau.com/dashboard..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Versão otimizada para dispositivos móveis
              </p>
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
                {isLoading ? 'Salvando...' : (dashboard ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};