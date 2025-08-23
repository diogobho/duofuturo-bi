import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Dashboards Interativos",
      description: "Visualize seus dados com dashboards modernos e interativos powered by Tableau Cloud."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: "Business Intelligence",
      description: "Transforme dados complexos em insights acionáveis para sua tomada de decisão."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Gestão de Usuários",
      description: "Sistema completo de gestão de usuários com controle de acesso por dashboard."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Segurança Avançada",
      description: "Autenticação JWT, sessões Redis e controle de permissões por função."
    }
  ];

  const values = [
    { title: "Inovação", description: "Sempre na vanguarda das tecnologias de BI" },
    { title: "Precisão", description: "Dados confiáveis e análises precisas" },
    { title: "Transparência", description: "Processos claros e comunicação aberta" },
    { title: "Resultados", description: "Foco em gerar valor real para o negócio" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold">DuoFuturo</h1>
                <p className="text-sm text-gray-300">Transformando dados em futuro</p>
              </div>
            </div>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Acessar Plataforma
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforme seus
              <span className="text-blue-600 block">dados em futuro</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma completa de Business Intelligence com dashboards interativos,
              gestão de usuários e integração Tableau Cloud para análises avançadas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossas Soluções
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos as melhores ferramentas para transformar seus dados
              em insights estratégicos para seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Sobre a DuoFuturo
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                <strong>Missão:</strong> Fornecer soluções avançadas de Business Intelligence
                que capacitem empresas a tomar decisões baseadas em dados com confiança e precisão.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                <strong>Visão:</strong> Ser a referência mundial em análise de dados e
                dashboards interativos, democratizando o acesso a insights de qualidade.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{value.title}</h4>
                      <p className="text-sm text-gray-600">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Entre em Contato
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">futuroncontato@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Localização</p>
                    <p className="text-gray-600">São Paulo, SP - Brasil</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/login"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center block transition-colors"
                >
                  Acessar Plataforma
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar seus dados?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se às empresas que já utilizam nossa plataforma para
            tomar decisões mais inteligentes baseadas em dados.
          </p>
          <Link
            to="/login"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center"
          >
            Começar Gratuitamente
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              <div>
                <h3 className="text-xl font-bold">DuoFuturo</h3>
                <p className="text-sm text-gray-300">Transformando dados em futuro</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-300 mb-2">
                © 2025 DuoFuturo. Todos os direitos reservados.
              </p>
              <p className="text-sm text-gray-400">
                São Paulo, SP - Brasil | futuroncontato@gmail.com
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};