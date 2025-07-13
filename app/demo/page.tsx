"use client";

import { MainScreen } from "@/components/MainScreen";
import { useState } from "react";
import { DashboardSummary } from "@/components/dashboard-summary";
import { Deposit } from "@/components/deposit";
import { SendFunds } from "@/components/send-funds";
import { ActivityFeed } from "@/components/ActivityFeed";
import { NewProducts } from "@/components/NewProducts";

export default function DemoPage() {
  const [activeComponent, setActiveComponent] = useState<"dashboard" | "deposit" | "send">("dashboard");
  const demoWalletAddress = "0x1234...5678";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-4">
        <div className="mb-6 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm font-semibold text-amber-800 mb-1">Demo Mode</p>
          <p className="text-xs text-amber-700">
            This is a demo to showcase the updated design. Authentication is bypassed.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Creda Network</h1>
            <button className="text-secondary flex items-center gap-1 text-base tap-target p-2 -m-2 rounded-md hover:bg-secondary/10 animate-smooth">
              <span>Sign out</span>
            </button>
          </div>

          <DashboardSummary
            onDepositClick={() => setActiveComponent("deposit")}
            onSendClick={() => setActiveComponent("send")}
          />
        </div>

        {activeComponent === "deposit" && (
          <div className="mb-8">
            <button 
              onClick={() => setActiveComponent("dashboard")}
              className="mb-4 text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </button>
            <Deposit onComplete={() => setActiveComponent("dashboard")} />
          </div>
        )}

        {activeComponent === "send" && (
          <div className="mb-8">
            <button 
              onClick={() => setActiveComponent("dashboard")}
              className="mb-4 text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </button>
            <SendFunds 
              onTransactionComplete={() => setActiveComponent("dashboard")} 
              walletAddress={demoWalletAddress}
            />
          </div>
        )}

        {activeComponent === "dashboard" && (
          <>
            <NewProducts />
            <ActivityFeed />
          </>
        )}
      </div>
    </div>
  );
}