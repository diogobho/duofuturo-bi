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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Auth endpoints
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

  async register(userData: {
    username: string;
    password: string;
    nome: string;
    email: string;
    data_nascimento: string;
    endereco: string;
    role?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async resetPassword(email: string, data_nascimento: string, new_password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, data_nascimento, new_password }),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: number) {
    return this.request(`/users/${id}`);
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

  async updateUser(id: number, userData: {
    username?: string;
    nome?: string;
    email?: string;
    data_nascimento?: string;
    endereco?: string;
    role?: string;
  }) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async changePassword(userId: number, newPassword: string) {
    return this.request(`/users/${userId}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  // Dashboard endpoints
  async getDashboards() {
    return this.request('/dashboards');
  }

  async getDashboard(id: number) {
    return this.request(`/dashboards/${id}`);
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

  async updateDashboard(id: number, dashboardData: {
    nome?: string;
    descricao?: string;
    url?: string;
    classe?: string;
  }) {
    return this.request(`/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dashboardData),
    });
  }

  async deleteDashboard(id: number) {
    return this.request(`/dashboards/${id}`, {
      method: 'DELETE',
    });
  }

  async getTableauToken() {
    return this.request('/dashboards/tableau/token');
  }

  // Association endpoints - Basic
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

  // Association endpoints - Multiple selections
  async assignMultipleDashboards(userId: number, dashboardIds: number[]) {
    return this.request('/dashboards/assign-multiple', {
      method: 'POST',
      body: JSON.stringify({ userId, dashboardIds }),
    });
  }

  async assignDashboardToMultipleUsers(dashboardId: number, userIds: number[]) {
    return this.request('/dashboards/assign-to-multiple-users', {
      method: 'POST',
      body: JSON.stringify({ dashboardId, userIds }),
    });
  }

  // Query endpoints for associations
  async getAllAssignments() {
    return this.request('/dashboards/assignments');
  }

  async getUserDashboards(userId: number) {
    return this.request(`/users/${userId}/dashboards`);
  }

  async getUserAssignments(userId: number) {
    return this.getUserDashboards(userId);
  }

  async getUsersWithoutDashboard(dashboardId: number) {
    return this.request(`/dashboards/${dashboardId}/unassigned-users`);
  }

  async getDashboardsNotAssignedToUser(userId: number) {
    return this.request(`/users/${userId}/unassigned-dashboards`);
  }
}

export const authAPI = new ApiClient(API_BASE_URL);
