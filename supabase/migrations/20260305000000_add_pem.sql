-- Add PEM (Presupuesto de Ejecución Material / Precio mínimo) to promotions
ALTER TABLE promotions ADD COLUMN pem NUMERIC DEFAULT 0;
