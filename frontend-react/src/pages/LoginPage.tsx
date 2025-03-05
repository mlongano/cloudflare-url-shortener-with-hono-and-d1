import LoginForm from "@/components/LoginForm";
import { StatusMessageProps } from "@/types";
import { useState } from "react";

export default function LoginPage() {
  const [status, setStatus] = useState<StatusMessageProps>({
    message: "",
    type: "",
    visible: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "", type: "", visible: false });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus({
        message: "Login successful!",
        type: "success",
        visible: true,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus({
          message:
            error?.message || "Login failed. Please check your credentials.",
          type: "error",
          visible: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col justify-start items-center bg-muted p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">ShortIt User Login</h2>
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          status={status}
        />
      </div>
    </div>
  );
}
