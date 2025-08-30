import React, { useState, useEffect } from 'react';
import { BarChart3, X } from 'lucide-react';
import { authAPI } from '../services/api';

interface DashboardFormData {
  nome: string;
  descricao: string;
  url: string;
  iframe?: string;
  classe: string;
}

interface DashboardFormProps {
  dashboard?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const DashboardForm: React.FC<DashboardFormProps> = ({ dashboard, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<DashboardFormData>({
    nome: '',
    descricao: '',
    url: '',
    classe: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const classes = [
    'Mercado Financeiro',
    'Brand Analysis', 
    'Operacional',
    'Vendas',
    'Marketing',
    'RH',
    'Financeiro',
    'Estratégico',
    'Compliance'
  ];

  useEffect(() => {
    if (dashboard) {
      setFormData({
        nome: dashboard.nome || '',
        descricao: dashboard.descricao || '',
        url: dashboard.url || dashboard.link || '',
        classe: dashboard.classe || ''
      });
    }
  }, [dashboard]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.nome.trim()) newErrors.nome = 'Nome do dashboard é obrigatório';
    if (!formData.url.trim()) newErrors.url = 'URL do Tableau é obrigatória';
    if (!formData.classe.trim()) newErrors.classe = 'Classe/categoria é obrigatória';
    
    // Validar URL
    try {
      new URL(formData.url);
      if (!formData.url.includes('tableau.com')) {
        newErrors.url = 'URL deve ser do Tableau Cloud';
      }
    } catch {
      newErrors.url = 'URL inválida - deve começar com https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      if (dashboard) {
        await authAPI.updateDashboard(dashboard.id, formData);
        alert('Dashboard atualizado com sucesso!');
      } else {
        await authAPI.createDashboard(formData);
        alert('Dashboard criado com sucesso!');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar dashboard:', error);
      setErrors({ general: `Erro ao ${dashboard ? 'atualizar' : 'criar'} dashboard: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {dashboard ? 'Editar Dashboard' : 'Novo Dashboard'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Dashboard *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nome ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Vendas Mensais Q4"
                disabled={isLoading}
              />
              {errors.nome && <span className="text-red-500 text-sm mt-1">{errors.nome}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Breve descrição do dashboard (opcional)"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL do Tableau *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://prod-useast-a.online.tableau.com/..."
                disabled={isLoading}
              />
              {errors.url && <span className="text-red-500 text-sm mt-1">{errors.url}</span>}
              <p className="text-xs text-gray-500 mt-1">
                Cole aqui a URL completa do seu dashboard no Tableau Cloud
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe/Categoria *
              </label>
              <select
                name="classe"
                value={formData.classe}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.classe ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value="">Selecione uma categoria</option>
                {classes.map(classe => (
                  <option key={classe} value={classe}>{classe}</option>
                ))}
              </select>
              {errors.classe && <span className="text-red-500 text-sm mt-1">{errors.classe}</span>}
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : (dashboard ? 'Salvar Alterações' : 'Criar Dashboard')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
