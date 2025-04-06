import LoginForm from "@/components/LoginForm";
import { useState, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"; // Use react-router-dom
import { authService } from "@/services/authService";
import {
  StatusMessageProps,
  LoginCredentials,
  LoginApiResponse,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";
export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth(); // Get auth context methods
  const [status, setStatus] = useState<StatusMessageProps>({
    message: "",
    type: "",
    visible: false,
  });
  const loginMutation = useMutation<LoginApiResponse, Error, LoginCredentials>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Handle successful login
      console.log("Login Successful", data);
      setStatus({
        message: "Login successful!",
        type: "success",
        visible: true,
      });

      if (data.result) {
        auth.login(data.result);
      }

      navigate("/dashboard");
    },
    onError: (error) => {
      // Handle login error
      console.error("Login error:", error);
      setStatus({
        message:
          error.message || "Login failed. Please check your credentials.",
        type: "error",
        visible: true,
      });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ message: "", type: "", visible: false });
    console.log("Handling form submission");
    const formData = new FormData(event.currentTarget);
    console.log("Form data:", formData);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setStatus({
        message: "Email and password are required.",
        type: "error",
        visible: true,
      });
      return;
    }

    loginMutation.mutate({ email, password });
  }
  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col justify-start items-center bg-muted p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">ShortIt User Login</h2>
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={loginMutation.isPending}
          status={status}
        />
      </div>
    </div>
  );
}
