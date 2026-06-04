import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upjbcrdqaivgfsqmfmaf.supabase.co";
const supabaseKey = "sb_publishable_ewZ1Y6rh3jRg5HA_R3BPHw_uMhMLs7h";

export const supabase = createClient(supabaseUrl, supabaseKey);