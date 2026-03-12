import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./lib/supabase";
import StudioWall from "./pages/StudioWall";
import AuthPage from "./pages/AuthPage";

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // loading
  if (!session) return <AuthPage />;
  return <StudioWall />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
