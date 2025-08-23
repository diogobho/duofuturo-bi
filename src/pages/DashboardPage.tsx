import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { authAPI } from '../services/api';
import { showToast } from '../components/Toaster';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  BarChart3, 
  Monitor, 
  Smartphone, 
  Maximize, 
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Dashboard {
  id: number;
  classe: string;
  nome: string;
  iframe: string;
  link: string;
  link_mobile: string;
  has_access?: boolean;
}

export const DashboardPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [tableauToken, setTableauToken] = useState<string>('');

  useEffect(() => {
    loadDashboards();
    refreshTableauToken();
    
    // Refresh token every 8 minutes
    const tokenInterval = setInterval(refreshTableauToken, 8 * 60 * 1000);
    
    return () => clearInterval(tokenInterval);
  }, []);

  const refreshTableauToken = async () => {
    try {
      const response = await authAPI.getTableauToken();
      setTableauToken(response.token);
    } catch (error) {
      console.error('Token refresh error:', error);
      showToast({
        type: 'warning',
        title: 'Token refresh failed',
        message: 'Some features may be limited'
      });
    }
  };

  const loadDashboards = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getDashboards();
      setDashboards(response.dashboards);
      
      // Auto-select first available dashboard
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

  const loadDashboard = async (dashboard: Dashboard) => {
    try {
      setIsDashboardLoading(true);
      const response = await authAPI.getDashboard(dashboard.id);
      setSelectedDashboard(response.dashboard);
      
      if (response.dashboard.tableau_token) {
        setTableauToken(response.dashboard.tableau_token);
      }
    } catch (error: any) {
      console.error('Load dashboard error:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar dashboard',
        message: error.message || 'Acesso negado ou dashboard não encontrado'
      });
    } finally {
      setIsDashboardLoading(false);
    }
  };

  const openFullscreen = () => {
    if (selectedDashboard) {
      const url = isMobileView ? selectedDashboard.link_mobile : selectedDashboard.link;
      window.open(url, '_blank');
    }
  };

  const getDashboardUrl = () => {
    if (!selectedDashboard) return '';
    
    const baseUrl = isMobileView ? selectedDashboard.link_mobile : selectedDashboard.iframe;
    
    // Add Tableau parameters
    const params = new URLSearchParams({
      ':embed': 'yes',
      ':showVizHome': 'no',
      ':toolbar': 'top',
      ':tabs': 'yes'
    });
    
    // Add token if available
    if (tableauToken) {
      params.set('token', tableauToken);
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  if (isLoading) {
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
            Dashboards Interativos
          </h1>
          <p className="text-gray-600">
            Visualize seus dados com dashboards powered by Tableau Cloud
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Dashboard List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Dashboards Disponíveis
              </h2>
              
              <div className="space-y-3">
                {dashboards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>Nenhum dashboard disponível</p>
                  </div>
                ) : (
                  dashboards.map((dashboard) => (
                    <button
                      key={dashboard.id}
                      onClick={() => loadDashboard(dashboard)}
                      disabled={dashboard.has_access === false}
                      className={`
                        w-full text-left p-3 rounded-md border transition-colors
                        ${selectedDashboard?.id === dashboard.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : dashboard.has_access === false
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="font-medium text-sm">{dashboard.nome}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {dashboard.classe}
                      </div>
                      {dashboard.has_access === false && (
                        <div className="text-xs text-red-500 mt-1">
                          Acesso não autorizado
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={loadDashboards}
                className="mt-4 w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Lista
              </button>
            </div>
          </div>

          {/* Dashboard Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              {selectedDashboard ? (
                <>
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 space-y-3 sm:space-y-0">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedDashboard.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedDashboard.classe}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* View Toggle */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setIsMobileView(false)}
                          className={`
                            flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors
                            ${!isMobileView 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                            }
                          `}
                        >
                          <Monitor className="w-3 h-3 mr-1" />
                          Desktop
                        </button>
                        <button
                          onClick={() => setIsMobileView(true)}
                          className={`
                            flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors
                            ${isMobileView 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                            }
                          `}
                        >
                          <Smartphone className="w-3 h-3 mr-1" />
                          Mobile
                        </button>
                      </div>
                      
                      {/* Actions */}
                      <button
                        onClick={openFullscreen}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Abrir
                      </button>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="relative" style={{ height: '600px' }}>
                    {isDashboardLoading && (
                      <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
                        <LoadingSpinner size="large" />
                      </div>
                    )}
                    
                    <iframe
                      src={getDashboardUrl()}
                      className="w-full h-full border-0 rounded-b-lg"
                      allow="fullscreen"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      onLoad={() => setIsDashboardLoading(false)}
                      style={{ 
                        minHeight: '600px',
                        opacity: isDashboardLoading ? 0 : 1,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Selecione um Dashboard</p>
                    <p className="text-sm">
                      Escolha um dashboard da lista para começar a visualizar seus dados
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