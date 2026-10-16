import { AuthProvider, useAuth } from "./lib/auth-context";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { Spinner } from "./components/ui";

function AppContent() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FAF8F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 14,
          fontFamily: "monospace",
          color: "#B2AB99",
          fontSize: 12,
        }}
      >
        <Spinner size={28} />
        <span>Checking session...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LoginPage />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
