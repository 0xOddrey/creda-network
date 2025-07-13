"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";
import { useEffect, useState } from "react";

export function Login() {
  const { login, status } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.origin);
    
    // Log environment info for debugging
    console.log("Auth Debug Info:", {
      origin: window.location.origin,
      apiKey: process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY?.substring(0, 20) + "...",
      chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      authStatus: status
    });
    
    // Global error handler for popup blocked
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("Failed to open popup window")) {
        setAuthError(true);
        event.preventDefault();
      }
    };
    
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [status]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setAuthError(false);
      
      // Test if popups are blocked
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (!testPopup || testPopup.closed || typeof testPopup.closed == 'undefined') {
        // Popup blocked
        console.error("Popups are blocked by the browser");
        setAuthError(true);
        return;
      } else {
        testPopup.close();
      }
      
      // Proceed with login
      await login();
    } catch (error) {
      console.error("Login failed:", error);
      setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Creda Network</h1>
        <p className="text-gray-600 mb-8">Sign in to access your wallet and start managing your funds.</p>
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
        
        {authError && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-semibold text-red-800 mb-2">Authentication Configuration Required</p>
            <p className="text-xs text-red-700 mb-3">
              The Crossmint authentication is failing because <code className="bg-red-100 px-1 rounded">{currentUrl}</code> is not whitelisted.
            </p>
            <div className="bg-white p-3 rounded border border-red-200">
              <p className="text-xs font-semibold text-gray-800 mb-2">To fix this:</p>
              <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://staging.crossmint.com/console" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Crossmint Staging Console</a></li>
                <li>Navigate to your API key settings</li>
                <li>Add <code className="bg-gray-100 px-1 rounded">{currentUrl}</code> to allowed origins</li>
                <li>Save and refresh this page</li>
              </ol>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Meanwhile, you can view the demo at <a href="/demo" className="text-blue-600 underline">/demo</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
