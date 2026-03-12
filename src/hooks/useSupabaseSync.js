import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

const LS = { notes: "sw3_notes", dl: "sw3_dl", inbox: "sw3_inbox" };

function loadLocal(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export default function useSupabaseSync(initNotes, initInbox) {
  const [notes, setNotes] = useState(null);
  const [deadlines, setDeadlines] = useState(null);
  const [inbox, setInbox] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Track whether initial load has set state, to avoid saving back on mount
  const initialLoadDone = useRef(false);

  // Debounce timers
  const notesTimer = useRef(null);
  const dlTimer = useRef(null);
  const inboxTimer = useRef(null);
  const userIdRef = useRef(null);

  // Load from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) {
        // No user — fall back to localStorage
        if (!cancelled) {
          setNotes(loadLocal(LS.notes, initNotes));
          setDeadlines(loadLocal(LS.dl, {}));
          setInbox(loadLocal(LS.inbox, initInbox));
          setLoaded(true);
          initialLoadDone.current = true;
        }
        return;
      }

      userIdRef.current = user.id;

      const { data, error } = await supabase
        .from("user_data")
        .select("notes, deadlines, inbox")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Supabase load error:", error);
      }

      if (data && (data.notes || data.deadlines || data.inbox)) {
        // Use Supabase data
        setNotes(data.notes ?? loadLocal(LS.notes, initNotes));
        setDeadlines(data.deadlines ?? loadLocal(LS.dl, {}));
        setInbox(data.inbox ?? loadLocal(LS.inbox, initInbox));
      } else {
        // No Supabase row yet — migrate from localStorage
        const localNotes = loadLocal(LS.notes, initNotes);
        const localDl = loadLocal(LS.dl, {});
        const localInbox = loadLocal(LS.inbox, initInbox);

        setNotes(localNotes);
        setDeadlines(localDl);
        setInbox(localInbox);

        // Persist localStorage data to Supabase
        await supabase.from("user_data").upsert({
          id: user.id,
          notes: localNotes,
          deadlines: localDl,
          inbox: localInbox,
          updated_at: new Date().toISOString(),
        });
      }

      setLoaded(true);
      // Small delay so the first render with data doesn't trigger save
      setTimeout(() => {
        initialLoadDone.current = true;
      }, 0);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced save helper
  const saveToSupabase = useCallback((field, value, timerRef) => {
    if (!initialLoadDone.current || !userIdRef.current) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const { error } = await supabase.from("user_data").upsert({
        id: userIdRef.current,
        [field]: value,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error(`Supabase save error (${field}):`, error);
    }, 500);
  }, []);

  // Watch for changes and debounce-save
  useEffect(() => {
    if (notes === null) return;
    saveToSupabase("notes", notes, notesTimer);
  }, [notes, saveToSupabase]);

  useEffect(() => {
    if (deadlines === null) return;
    saveToSupabase("deadlines", deadlines, dlTimer);
  }, [deadlines, saveToSupabase]);

  useEffect(() => {
    if (inbox === null) return;
    saveToSupabase("inbox", inbox, inboxTimer);
  }, [inbox, saveToSupabase]);

  return { notes, deadlines, inbox, setNotes, setDeadlines, setInbox, loaded };
}
