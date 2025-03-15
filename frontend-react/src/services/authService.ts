// API service for login
// services/authService.ts
type LoginCredentials = {
  email: string;
  password: string;
}

type LoginResponse = {
  success: boolean;
  result: {
    id: number;
    email: string;
    token: string;
    refreshToken: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch('http://localhost:8787/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  }
};
