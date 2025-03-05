## Code from LLM

```ts
// Type definitions
// types/index.ts
// User interface
interface User {
  id: string;
  email: string;
  name: string;
}

// Login credentials interface
interface LoginCredentials {
  email: string;
  password: string;
}

// Login response interface
interface LoginResponse {
  user: User;
  token: string;
}

// Status message interface
interface StatusMessageProps {
  message: string;
  type: 'success' | 'error' | '';
  visible: boolean;
}

// Form group props interface
interface FormGroupProps {
  id: string;
  label: string;
  type: string;
  required: boolean;
  disabled?: boolean;
}

// Login form props interface
interface LoginFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  status: StatusMessageProps;
}

// Feature interface
interface Feature {
  title: string;
  icon: string;
  description: string;
}

// API service for login
// services/authService.ts
const authService = {
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

// App.tsx - Main component with routing
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// components/Header.tsx
function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Logo />
          <Navigation />
          <LoginButton />
        </div>
      </div>
    </header>
  );
}

// components/Logo.tsx
function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <span className="ml-2 text-xl font-bold text-gray-800">AppName</span>
    </Link>
  );
}

// components/Navigation.tsx
function Navigation() {
  return (
    <nav className="hidden md:block">
      <ul className="flex space-x-8">
        <li>
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition duration-200">
            Home
          </Link>
        </li>
        <li>
          <Link to="/features" className="text-gray-600 hover:text-blue-600 transition duration-200">
            Features
          </Link>
        </li>
        <li>
          <Link to="/about" className="text-gray-600 hover:text-blue-600 transition duration-200">
            About
          </Link>
        </li>
        <li>
          <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition duration-200">
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// components/LoginButton.tsx
function LoginButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/login')}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
    >
      Login
    </button>
  );
}

// components/Footer.tsx
function Footer() {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">AppName</h3>
            <p className="text-gray-400">Making your life easier since 2023</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {currentYear} AppName. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// components/LoadingSpinner.tsx
function LoadingSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

// components/StatusMessage.tsx
function StatusMessage({ message, type, visible }: StatusMessageProps) {
  if (!visible) return null;

  const baseClasses = "mt-4 py-3 px-3 rounded-md text-center";
  const typeClasses = type === 'success'
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message}
    </div>
  );
}

// components/FormGroup.tsx
function FormGroup({ id, label, type, required, disabled = false }: FormGroupProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-2 font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}

// components/LoginForm.tsx
function LoginForm({ onSubmit, isLoading, status }: LoginFormProps) {
  return (
    <>
      <form onSubmit={onSubmit}>
        <FormGroup
          id="email"
          label="Email"
          type="email"
          required={true}
          disabled={isLoading}
        />
        <FormGroup
          id="password"
          label="Password"
          type="password"
          required={true}
          disabled={isLoading}
        />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {isLoading && (
        <div className="mt-4 text-center text-gray-600">
          <LoadingSpinner />
          <span className="ml-2">Verifying credentials...</span>
        </div>
      )}

      <StatusMessage
        message={status.message}
        type={status.type}
        visible={status.visible}
      />

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}

// pages/HomePage.tsx
function HomePage() {
  const features: Feature[] = [
    { title: "Easy to Use", icon: "🚀", description: "Our intuitive interface makes everything simple." },
    { title: "Secure", icon: "🔒", description: "Your data is protected with the latest security measures." },
    { title: "Fast", icon: "⚡", description: "Lightning fast performance for all your needs." }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to AppName</h1>
        <p className="text-xl text-gray-600 mb-8">Your complete solution for everything you need.</p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition duration-200"
          >
            Get Started
          </Link>
          <Link
            to="/features"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md text-lg font-medium transition duration-200"
          >
            Learn More
          </Link>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// pages/LoginPage.tsx
function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<StatusMessageProps>({
    message: '',
    type: '',
    visible: false
  });

  // Use React Query's useMutation hook
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data: LoginResponse) => {
      setStatus({
        message: 'Login successful!',
        type: 'success',
        visible: true
      });

      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    },
    onError: (error: Error) => {
      setStatus({
        message: error.message || 'Login failed. Please check your credentials.',
        type: 'error',
        visible: true
      });
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const target = event.target as HTMLFormElement;
    const emailInput = target.elements.namedItem('email') as HTMLInputElement;
    const passwordInput = target.elements.namedItem('password') as HTMLInputElement;

    const email = emailInput.value;
    const password = passwordInput.value;

    // Clear previous status messages
    setStatus({ message: '', type: '', visible: false });

    // Execute the mutation
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={loginMutation.isPending}
          status={status}
        />
      </div>
    </div>
  );
}

// pages/DashboardPage.tsx
function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <p className="text-gray-600 mb-4">Welcome to your dashboard! You've successfully logged in.</p>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <p className="text-blue-800">This is a protected page that requires authentication.</p>
        </div>
      </div>
    </div>
  );
}
```
