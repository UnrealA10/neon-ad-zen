export type AdAccount = {
  id: string;
  created_at: string;
  created_by: string;
  name: string;
  platform:
    | "facebook"
    | "instagram"
    | "messenger"
    | "whatsapp"
    | "audience_network";
  account_external_id: string | null;
  status: "active" | "paused" | "disabled" | "pending";
  monthly_budget: number;
  currency: string;
  notes: string | null;
};

export type Campaign = {
  id: string;
  created_at: string;
  created_by: string;
  account_id: string;
  name: string;
  objective: string | null;
  status: "active" | "paused" | "completed" | "draft";
  start_date: string | null;
  end_date: string | null;
  daily_budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
};

export type TeamMember = {
  id: string;
  created_at: string;
  created_by: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  status: string | null;
};
