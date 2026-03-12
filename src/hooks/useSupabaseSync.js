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

  const initialLoadDone = useRef(false);
  const notesTimer = useRef(null);
  const dlTimer = useRef(null);
  const inboxTimer = useRef(null);
  const userIdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) {
        if (!cancelled) {
          setNotes(loadLocal(LS.notes, null) || initNotes);
          setDeadlines(loadLocal(LS.dl, null) || {});
          setInbox(loadLocal(LS.inbox, null) || initInbox);
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
        setNotes(loadLocal(LS.notes, null) || initNotes);
        setDeadlines(loadLocal(LS.dl, null) || {});
        setInbox(loadLocal(LS.inbox, null) || initInbox);
        setLoaded(true);
        initialLoadDone.current = true;
        return;
      }

      const finalNotes = (data && data.notes) || loadLocal(LS.notes, null) || initNotes;
      const finalDl = (data && data.deadlines) || loadLocal(LS.dl, null) || {};
      const finalInbox = (data && data.inbox) || loadLocal(LS.inbox, null) || initInbox;

      setNotes(finalNotes);
      setDeadlines(finalDl);
      setInbox(finalInbox);
      setLoaded(true);

      if (!data || !data.notes) {
        await supabase.from("user_data").upsert({
          id: user.id,
          notes: finalNotes,
          deadlines: finalDl,
          inbox: finalInbox,
          updated_at: new Date().toISOString(),
        });
      }

      setTimeout(() => {
        initialLoadDone.current = true;
      }, 0);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
