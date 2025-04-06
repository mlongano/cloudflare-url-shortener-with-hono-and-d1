import { LoginCredentials, LoginApiResponse } from "@/types";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginApiResponse> => {
    console.log("Credentials:", credentials);
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Include credentials in the request
    });

    const responseData: LoginApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message || `Login failed with status ${response.status}`,
      );
    }

    return responseData;
  },

  // --- Add Logout Function ---
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: "POST", // Use POST as it changes server state
      headers: {
        "Content-Type": "application/json", // Optional, might not be needed if no body
      },
      credentials: "include", // IMPORTANT: Send cookies!
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Even if backend fails, we might proceed with client logout
      console.error(
        "Logout API call failed:",
        responseData.message || response.statusText,
      );
      // TODO: Optionally throw an error, or just proceed with client-side logout
      // throw new Error(responseData.message || `Logout failed with status: ${response.status}`);
    }

    return responseData; // Return success/message from backend
  },
  // --- End Logout Function ---
};
