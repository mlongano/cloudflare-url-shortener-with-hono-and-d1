import { useState, useEffect } from "react";
import { DiagnosticsResponse } from "../types";

// Define an interface for the expected diagnostics data structure (optional but recommended)
// Replace this with the actual structure if known
const baseurl = import.meta.env.VITE_API_BASE_URL;

export default function DiagnosticsPage() {
  // State to store the fetched diagnostics data
  const [diagnosticsData, setDiagnosticsData] =
    useState<DiagnosticsResponse | null>(null);
  // State to track loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // Define the async function to fetch data
    async function fetchDiagnostics() {
      setIsLoading(true); // Set loading to true before fetching
      setError(null); // Clear any previous errors
      setDiagnosticsData(null); // Clear previous data

      try {
        // Use '/api/diagnostics' assuming your frontend dev server proxies requests
        // or if frontend and backend are served from the same origin.
        // Adjust the URL if needed (e.g., add VITE_API_URL prefix).
        const response = await fetch(`${baseurl}/health`);

        if (!response.ok) {
          // Handle HTTP errors (like 404, 500)
          const errorText = await response.text(); // Get error details if available
          throw new Error(
            `HTTP error! Status: ${response.status} - ${errorText || response.statusText}`,
          );
        }

        // Parse the JSON response
        const data: DiagnosticsResponse = await response.json();
        setDiagnosticsData(data); // Store the fetched data
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Failed to fetch diagnostics data: ${err.message}`);
        } else {
          setError(
            "An unknown error occurred while fetching diagnostics data.",
          );
        }
        console.error("Diagnostics fetch error:", err); // Log the error for debugging
      } finally {
        setIsLoading(false); // Set loading to false after fetch attempt (success or failure)
      }
    }

    // Call the fetch function when the component mounts
    fetchDiagnostics();

    // No cleanup needed in this simple case, but you could add an AbortController
    // here if the request needed to be cancellable.
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        System Diagnostics
      </h2>

      {isLoading && (
        <div className="text-center text-gray-500">
          Loading diagnostics data...
        </div>
      )}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {diagnosticsData && !isLoading && !error && (
        <div className="bg-muted p-6 rounded-lg shadow-md mt-4">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Diagnostics Details:
          </h3>
          {/* Display data - using JSON.stringify for simplicity, customize as needed */}
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(diagnosticsData, null, 2)}
          </pre>
          {/* Or display specific fields if you know the structure: */}
          {/*
          <ul className="space-y-2">
            <li><strong>Uptime:</strong> {diagnosticsData.uptime}</li>
            <li><strong>Database Status:</strong> {diagnosticsData.databaseStatus}</li>
            <li><strong>Memory Usage:</strong> {diagnosticsData.memoryUsage}</li>
            // Add other fields as necessary
          </ul>
          */}
        </div>
      )}

      {!isLoading && !error && !diagnosticsData && (
        <div className="text-center text-gray-500 mt-4">
          No diagnostics data available.
        </div>
      )}
    </div>
  );
}
