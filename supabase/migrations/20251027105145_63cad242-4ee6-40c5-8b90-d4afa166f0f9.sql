-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('manager', 'campaign_manager');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only managers can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Only managers can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Only managers can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

-- Create ad_accounts table
CREATE TABLE public.ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'Meta',
  client_name TEXT NOT NULL,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ad_accounts
CREATE POLICY "Managers can view all accounts"
  ON public.ad_accounts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Campaign managers can view their accounts"
  ON public.ad_accounts FOR SELECT
  TO authenticated
  USING (campaign_manager_id = auth.uid());

CREATE POLICY "Managers can insert accounts"
  ON public.ad_accounts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Campaign managers can insert their accounts"
  ON public.ad_accounts FOR INSERT
  TO authenticated
  WITH CHECK (campaign_manager_id = auth.uid());

CREATE POLICY "Managers can update accounts"
  ON public.ad_accounts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Campaign managers can update their accounts"
  ON public.ad_accounts FOR UPDATE
  TO authenticated
  USING (campaign_manager_id = auth.uid());

CREATE POLICY "Managers can delete accounts"
  ON public.ad_accounts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Campaign managers can delete their accounts"
  ON public.ad_accounts FOR DELETE
  TO authenticated
  USING (campaign_manager_id = auth.uid());

-- Create ads table
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account_id UUID REFERENCES public.ad_accounts(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  spend DECIMAL(10, 2) NOT NULL DEFAULT 0,
  budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ads (inherit from ad_accounts)
CREATE POLICY "Managers can view all ads"
  ON public.ads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ad_accounts
      WHERE ad_accounts.id = ads.account_id
      AND public.has_role(auth.uid(), 'manager')
    )
  );

CREATE POLICY "Campaign managers can view their ads"
  ON public.ads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ad_accounts
      WHERE ad_accounts.id = ads.account_id
      AND ad_accounts.campaign_manager_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert ads"
  ON public.ads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ad_accounts
      WHERE ad_accounts.id = ads.account_id
      AND public.has_role(auth.uid(), 'manager')
    )
  );

CREATE POLICY "Campaign managers can insert their ads"
  ON public.ads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ad_accounts
      WHERE ad_accounts.id = ads.account_id
      AND ad_accounts.campaign_manager_id = auth.uid()
    )
  );

CREATE POLICY "Managers can update ads"
  ON public.ads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ad_accounts
      WHERE ad_accounts.id = ads.account_id
      AND public.has_role(auth.uid(), 'manager')
    )
  );

CREATE POLICY "Campaign managers can update their ads"
  ON public.ads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ad_accounts
      WHERE ad_accounts.id = ads.account_id
      AND ad_accounts.campaign_manager_id = auth.uid()
    )
  );

CREATE POLICY "Managers can delete ads"
  ON public.ads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ad_accounts
      WHERE ad_accounts.id = ads.account_id
      AND public.has_role(auth.uid(), 'manager')
    )
  );

CREATE POLICY "Campaign managers can delete their ads"
  ON public.ads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ad_accounts
      WHERE ad_accounts.id = ads.account_id
      AND ad_accounts.campaign_manager_id = auth.uid()
    )
  );

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_accounts_updated_at
  BEFORE UPDATE ON public.ad_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();