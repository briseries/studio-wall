import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./lib/supabase";
import StudioWall from "./pages/StudioWall";
import AuthPage from "./pages/AuthPage";
import Playground from "./pages/Playground";

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

  // Hash-based route: #/playground shows the design system playground
  if (window.location.hash === "#/playground") return <Playground />;

  if (session === undefined) return null; // loading
  if (!session) return <AuthPage />;
  return <StudioWall />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
