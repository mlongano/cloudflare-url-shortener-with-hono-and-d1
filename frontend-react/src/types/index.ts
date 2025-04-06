export type StatusMessageProps = {
  message: string;
  type: "success" | "error" | "";
  visible: boolean;
};
type ConnInfo = {
  remote: {
    /** The remote IP address of the client connection. */
    address: string;
    // Note: Other properties might exist in different scenarios or adapters.
  };
};

export type DiagnosticsResponse = {
  status: string; // Made more specific as the example shows 'OK'
  timestamp: string;
  origin: string | undefined; // Still potentially undefined if header is missing
  host: string | undefined; // Still potentially undefined if header is missing
  url: string;
  cookies: Record<string, string> | undefined; // Still potentially undefined
  connInfo: ConnInfo; // Using the specific structure from the example
  header: Record<string, string>;
  raw: unknown; // Using unknown because {} doesn't tell us the real underlying type
};

export type LoginCredentials = {
  email: string;
  password: string;
};

// Define the expected successful login response structure from the backend
export type LoginSuccessPayload = {
  id: number;
  email: string;
  token: string; // Access token
  refreshToken: string;
};

export type LoginApiResponse = {
  success: boolean;
  result?: LoginSuccessPayload; // Present on success
  message?: string; // Present on error
};
