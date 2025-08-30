import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { showToast } from '../components/Toaster';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  BarChart3, 
  RefreshCw, 
  Maximize2, 
  Monitor, 
  Smartphone,
  Eye,
  AlertCircle
} from 'lucide-react';

interface Dashboard {
  id: number;
  nome: string;
  classe: string;
  descricao?: string;
  url?: string;
  iframe?: string;
  link?: string;
  link_mobile?: string;
  has_access?: boolean;
}

export const DashboardPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getDashboards();
      setDashboards(response.dashboards);
      
      if (response.dashboards.length > 0) {
        const firstAvailable = response.dashboards.find((d: Dashboard) => 
          d.has_access !== false
        );
        if (firstAvailable) {
          setSelectedDashboard(firstAvailable);
        }
      }
    } catch (error: any) {
      console.error('Load dashboards error:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar dashboards',
        message: error.message || 'Tente novamente mais tarde'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardUrl = () => {
    if (!selectedDashboard) return '';
    
    // Usar iframe URL se disponível, senão usar url padrão
    let baseUrl = selectedDashboard.iframe || selectedDashboard.url || '';
    
    if (!baseUrl) return '';
    
    // Adicionar parâmetros para embedding se não estiverem presentes
    if (!baseUrl.includes('?')) {
      baseUrl += '?:embed=yes&:toolbar=bottom&:showVizHome=no&:device=desktop';
    }
    
    return baseUrl;
  };

  const openFullscreen = () => {
    if (selectedDashboard) {
      const url = selectedDashboard.link || selectedDashboard.iframe || selectedDashboard.url;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
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
            Dashboards Interativos
          </h1>
          <p className="text-gray-600">
            Visualize seus dados com dashboards powered by Tableau Cloud
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lista de Dashboards */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Dashboards Disponíveis
                </h2>
                <button
                  onClick={loadDashboards}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Atualizar Lista"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {dashboards.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum dashboard disponível</p>
                  </div>
                ) : (
                  dashboards.map((dashboard) => (
                    <button
                      key={dashboard.id}
                      onClick={() => setSelectedDashboard(dashboard)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedDashboard?.id === dashboard.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm mb-1">
                        {dashboard.nome}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dashboard.classe}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Dashboard Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {selectedDashboard ? (
                <>
                  {/* Dashboard Header */}
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {selectedDashboard.nome}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedDashboard.classe}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setIsMobileView(false)}
                            className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              !isMobileView 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Monitor className="w-4 h-4 mr-1" />
                            Desktop
                          </button>
                          <button
                            onClick={() => setIsMobileView(true)}
                            className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              isMobileView 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Smartphone className="w-4 h-4 mr-1" />
                            Mobile
                          </button>
                        </div>

                        <button
                          onClick={openFullscreen}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Abrir em Tela Cheia"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6">
                    <div className="relative bg-gray-50 rounded-lg overflow-hidden" 
                         style={{ height: '1200px', minHeight: '800px' }}>
                      {isDashboardLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                          <LoadingSpinner size="large" />
                        </div>
                      )}
                      
                      <iframe
                        src={getDashboardUrl()}
                        className="w-full h-full border-0"
                        allow="fullscreen"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                        onLoad={() => setIsDashboardLoading(false)}
                        title={`Dashboard: ${selectedDashboard.nome}`}
                        style={{ 
                          width: '100%',
                          height: '1200px',
                          border: 'none',
                          overflow: 'hidden'
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione um Dashboard
                    </h3>
                    <p className="text-gray-500">
                      Escolha um dashboard da lista para visualizar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
