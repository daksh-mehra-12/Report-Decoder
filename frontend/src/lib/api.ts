const API_BASE = 'http://localhost:8000/api/v1';

export class ApiClient {
  private static token: string | null = localStorage.getItem('lablens_token');

  static setToken(token: string) {
    this.token = token;
    localStorage.setItem('lablens_token', token);
  }

  static clearToken() {
    this.token = null;
    localStorage.removeItem('lablens_token');
  }

  static getToken(): string | null {
    return this.token;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch {
        // use default
      }
      throw new Error(errorMsg);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Auth
  static async register(data: any) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async login(email: string, password: string) {
    const res = await this.request<any>('/auth/login-json', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  static async getMe() {
    return this.request<any>('/auth/me');
  }

  static async forgotPassword(email: string) {
    return this.request<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async resetPassword(email: string, newPassword: string, token?: string) {
    return this.request<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, new_password: newPassword, token }),
    });
  }

  // Reports
  static async uploadReport(formData: FormData) {
    return this.request<any>('/reports/upload', {
      method: 'POST',
      body: formData,
    });
  }

  static async listReports() {
    return this.request<any[]>('/reports');
  }

  static async getReport(reportId: string) {
    return this.request<any>(`/reports/${reportId}`);
  }

  static async deleteReport(reportId: string) {
    return this.request<any>(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // Verification Workspace
  static async updateParameter(reportId: string, paramId: string, updateData: any) {
    return this.request<any>(`/reports/${reportId}/parameters/${paramId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  static async verifyParameter(reportId: string, paramId: string, verified = true) {
    return this.request<any>(`/reports/${reportId}/parameters/${paramId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verified }),
    });
  }

  // TrustTrace
  static async getTrustTrace(reportId: string, paramId: string) {
    return this.request<any>(`/reports/${reportId}/parameters/${paramId}/trust-trace`);
  }

  // Report Quality Radar
  static async getQualityRadar(reportId: string) {
    return this.request<any>(`/reports/${reportId}/quality-radar`);
  }

  // VisitReady
  static async getVisitReady(reportId: string, lang = 'en') {
    return this.request<any>(`/reports/${reportId}/visit-ready?lang=${lang}`);
  }

  static async getVisitReadyWithContext(reportId: string, context: any, lang = 'en') {
    return this.request<any>(`/reports/${reportId}/visit-ready/with-context?lang=${lang}`, {
      method: 'POST',
      body: JSON.stringify(context),
    });
  }

  // Explanations
  static async getExplanation(reportId: string, paramId: string, lang = 'en') {
    return this.request<any>(`/classification/reports/${reportId}/parameters/${paramId}/explanation?lang=${lang}`);
  }

  // Standalone Classification
  static async classifySingle(payload: any) {
    return this.request<any>('/classification/classify-single', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Comparability & Trends
  static async evaluateComparability(payload: any) {
    return this.request<any>('/comparison/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async getHistoricalTrends(canonicalCode: string) {
    return this.request<any>(`/comparison/historical-trends?canonical_code=${canonicalCode}`);
  }

  // Doctor Sharing
  static async shareReport(reportId: string, doctorEmail: string) {
    return this.request<any>(`/reports/${reportId}/shares`, {
      method: 'POST',
      body: JSON.stringify({ doctor_email: doctorEmail }),
    });
  }

  static async revokeShare(reportId: string, shareId: string) {
    return this.request<any>(`/reports/${reportId}/shares/revoke/${shareId}`, {
      method: 'POST',
    });
  }

  static async listShares(reportId: string) {
    return this.request<any[]>(`/reports/${reportId}/shares`);
  }

  // Knowledge Hub
  static async getKnowledgeTests() {
    return this.request<any[]>('/knowledge/tests');
  }

  static async searchKnowledge(q: string) {
    return this.request<any[]>(`/knowledge/search?q=${encodeURIComponent(q)}`);
  }

  static async getKnowledgeSources() {
    return this.request<any[]>('/knowledge/sources');
  }

  // Admin
  static async getAdminMetrics() {
    return this.request<any>('/admin/metrics');
  }

  // PDF Download
  static async downloadPdf(reportId: string, filename = 'LabLens_Summary.pdf') {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}/reports/${reportId}/export-pdf`, { headers });
    if (!res.ok) throw new Error('Failed to generate PDF');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Assistant Chatbot
  static async sendChatMessage(
    message: string,
    history: any[] = [],
    context?: any,
    language = 'en'
  ) {
    return this.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_history: history,
        context,
        language,
      }),
    });
  }
}

