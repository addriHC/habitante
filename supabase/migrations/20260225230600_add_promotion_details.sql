ALTER TABLE promotions
ADD COLUMN profitability numeric(5,2) DEFAULT NULL,
ADD COLUMN min_investment numeric(10,2) DEFAULT NULL,
ADD COLUMN duration_months integer DEFAULT NULL,
ADD COLUMN investment_status text DEFAULT NULL,
ADD COLUMN description text DEFAULT NULL,
ADD COLUMN progress_percentage integer DEFAULT NULL,
ADD COLUMN gallery_images text[] DEFAULT '{}'::text[];
