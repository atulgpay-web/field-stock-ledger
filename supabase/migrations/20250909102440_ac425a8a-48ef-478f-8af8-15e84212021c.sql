-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'supervisor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_receipts table
CREATE TABLE public.stock_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_code TEXT NOT NULL,
  quantity_received DECIMAL(10,2) NOT NULL CHECK (quantity_received > 0),
  rate_per_unit DECIMAL(10,2) NOT NULL CHECK (rate_per_unit > 0),
  unit_of_measurement TEXT NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  supplier_name TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  received_by TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_consumptions table
CREATE TABLE public.stock_consumptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_code TEXT NOT NULL,
  quantity_used DECIMAL(10,2) NOT NULL CHECK (quantity_used > 0),
  purpose TEXT NOT NULL,
  activity_code TEXT NOT NULL,
  used_by TEXT NOT NULL,
  date DATE NOT NULL,
  remarks TEXT,
  rate_per_unit DECIMAL(10,2) NOT NULL CHECK (rate_per_unit > 0),
  total_value DECIMAL(12,2) NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_consumptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for stock_receipts
CREATE POLICY "Users can view all stock receipts" 
ON public.stock_receipts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create stock receipts" 
ON public.stock_receipts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update stock receipts" 
ON public.stock_receipts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for stock_consumptions
CREATE POLICY "Users can view all stock consumptions" 
ON public.stock_consumptions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create stock consumptions" 
ON public.stock_consumptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update stock consumptions" 
ON public.stock_consumptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_receipts_updated_at
BEFORE UPDATE ON public.stock_receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_consumptions_updated_at
BEFORE UPDATE ON public.stock_consumptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_stock_receipts_item_code ON public.stock_receipts(item_code);
CREATE INDEX idx_stock_receipts_user_id ON public.stock_receipts(user_id);
CREATE INDEX idx_stock_receipts_delivery_date ON public.stock_receipts(delivery_date);

CREATE INDEX idx_stock_consumptions_item_code ON public.stock_consumptions(item_code);
CREATE INDEX idx_stock_consumptions_user_id ON public.stock_consumptions(user_id);
CREATE INDEX idx_stock_consumptions_date ON public.stock_consumptions(date);

-- Create a view for current inventory (fixed column ambiguity)
CREATE VIEW public.current_inventory AS
SELECT 
  items.item_code,
  items.item_name,
  items.unit_of_measurement,
  COALESCE(receipts.total_received, 0) - COALESCE(consumptions.total_consumed, 0) AS current_stock,
  COALESCE(receipts.last_rate, 0) AS last_rate_per_unit,
  (COALESCE(receipts.total_received, 0) - COALESCE(consumptions.total_consumed, 0)) * COALESCE(receipts.last_rate, 0) AS total_value,
  GREATEST(COALESCE(receipts.last_updated, '1970-01-01'::timestamp), COALESCE(consumptions.last_updated, '1970-01-01'::timestamp)) AS last_updated
FROM (
  SELECT DISTINCT item_code, item_name, unit_of_measurement FROM public.stock_receipts
  UNION
  SELECT DISTINCT item_code, item_name, 'units' FROM public.stock_consumptions
) items
LEFT JOIN (
  SELECT 
    item_code,
    SUM(quantity_received) AS total_received,
    MAX(rate_per_unit) AS last_rate,
    MAX(updated_at) AS last_updated
  FROM public.stock_receipts
  GROUP BY item_code
) receipts ON items.item_code = receipts.item_code
LEFT JOIN (
  SELECT 
    item_code,
    SUM(quantity_used) AS total_consumed,
    MAX(updated_at) AS last_updated
  FROM public.stock_consumptions
  GROUP BY item_code
) consumptions ON items.item_code = consumptions.item_code;