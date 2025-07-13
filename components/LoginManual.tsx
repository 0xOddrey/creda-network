"use client";

import { useState } from "react";

export function LoginManual({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Since Crossmint popup is failing, this is a placeholder
    // In production, you would integrate with Crossmint's API directly
    console.log("Manual login attempt with:", email);
    
    // Simulate login for demo purposes
    setTimeout(() => {
      setIsLoading(false);
      alert("Manual authentication would be implemented here. For now, use the demo mode.");
    }, 1000);
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome to Creda Network</h1>
        <p className="text-gray-600 mb-8 text-center">Sign in to access your wallet and start managing your funds.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? "Signing in..." : "Continue with Email"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having issues? Try the <a href="/demo" className="text-primary underline">demo mode</a>
          </p>
        </div>
      </div>
    </div>
  );
}