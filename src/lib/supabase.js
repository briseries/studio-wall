import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ukwvfnfkpnfyrzqeiisn.supabase.co";
const supabaseKey = "sb_publishable_x2Ckhwnk_fBooLIObo5uAQ_2fjViXNQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
