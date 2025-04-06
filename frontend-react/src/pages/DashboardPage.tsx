import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { user, logout: logoutClientState } = useAuth(); // Get user and client logout function
  const navigate = useNavigate();

  // Mutation for calling the backend logout endpoint
  const logoutMutation = useMutation({
    mutationFn: authService.logout, // Function to call backend logout
    onSuccess: () => {
      console.log("Backend logout successful");
      // Client-side cleanup and redirect is now handled in onSettled
    },
    onError: (error) => {
      console.error("Backend logout failed:", error);
      // Still proceed with client-side logout even if backend fails
      // Or show an error message to the user
    },
    onSettled: () => {
      // This runs after success or error
      console.log("Performing client-side logout and redirect");
      logoutClientState(); // Clear client auth state from context
      navigate("/login"); // Redirect to login page
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate(); // Trigger the backend logout call
  };

  // Optional: Redirect if user is not authenticated (basic protection)
  // A more robust solution involves a ProtectedRoute component
  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login"); // Uncomment if you want immediate redirect
    }
  }, [user, navigate]);

  if (!user) {
    // Optionally show a loading state or redirect immediately
    // return <Spinner />;
    return <div>Redirecting to login...</div>; // Or navigate('/login') directly
  }
  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Logout Button Top Right */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="absolute top-4 right-4" // Positioning
      >
        {logoutMutation.isPending ? (
          <Spinner size="sm" className="mr-2" />
        ) : null}
        Logout
      </Button>
      <div className="bg-card p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-card-foreground mb-6">
          Dashboard
        </h2>
        <p className="text-muted-foreground mb-4">
          Welcome, {user?.email}! You've successfully logged in.{" "}
        </p>
        {/* Add dashboard content here */}
      </div>
    </div>
  );
}
