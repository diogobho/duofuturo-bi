const API_BASE_URL = '/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async login(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: {
    username: string;
    password: string;
    nome: string;
    email: string;
    data_nascimento: string;
    endereco: string;
    role?: string;
  }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getDashboards() {
    return this.request('/dashboards');
  }

  async createDashboard(dashboardData: {
    nome: string;
    descricao: string;
    url: string;
    classe: string;
  }) {
    return this.request('/dashboards', {
      method: 'POST',
      body: JSON.stringify(dashboardData),
    });
  }

  async assignDashboard(userId: number, dashboardId: number) {
    return this.request('/dashboards/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, dashboardId }),
    });
  }

  async unassignDashboard(userId: number, dashboardId: number) {
    return this.request('/dashboards/unassign', {
      method: 'POST',
      body: JSON.stringify({ userId, dashboardId }),
    });
  }

  async getUserAssignments(userId: number) {
    return this.request(`/users/${userId}/dashboards`);
  }
}

export const authAPI = new ApiClient(API_BASE_URL);
