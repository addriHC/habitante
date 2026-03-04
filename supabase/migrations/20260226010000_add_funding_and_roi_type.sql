-- Migration to add target_funding and profitability_type to promotions table
ALTER TABLE promotions 
ADD COLUMN target_funding numeric(12,2) DEFAULT NULL,
ADD COLUMN profitability_type text DEFAULT 'total' CHECK (profitability_type IN ('total', 'anual'));
