-- Faza II / VII: programmabilitet në nivel DB (versioned migration)
-- Ekzekutohet nga backend/db/runMigrations.js në startup

DROP PROCEDURE IF EXISTS sp_tradein_review_queue;
CREATE PROCEDURE sp_tradein_review_queue()
BEGIN
  SELECT
    id, car_id, buyer_name, buyer_email, trade_in_car, trade_in_year,
    trade_in_mileage_km, trade_in_value, amount_to_add, created_at
  FROM purchases
  WHERE trade_in_car IS NOT NULL
    AND trade_in_status = 'pending'
  ORDER BY created_at DESC;
END;

DROP TRIGGER IF EXISTS trg_purchases_before_insert;
CREATE TRIGGER trg_purchases_before_insert
BEFORE INSERT ON purchases
FOR EACH ROW
BEGIN
  SET NEW.buyer_email = LOWER(TRIM(NEW.buyer_email));
  IF NEW.trade_in_value IS NULL THEN
    SET NEW.trade_in_value = 0;
  END IF;
  IF NEW.amount_to_add IS NULL OR NEW.amount_to_add < 0 THEN
    SET NEW.amount_to_add = GREATEST(0, NEW.car_price - IFNULL(NEW.trade_in_value, 0));
  END IF;
  IF NEW.trade_in_car IS NULL OR TRIM(NEW.trade_in_car) = '' THEN
    SET NEW.trade_in_status = 'approved';
  END IF;
END;

DROP TRIGGER IF EXISTS trg_purchases_before_update;
CREATE TRIGGER trg_purchases_before_update
BEFORE UPDATE ON purchases
FOR EACH ROW
BEGIN
  IF NEW.trade_in_status = 'rejected' THEN
    SET NEW.amount_to_add = NEW.car_price;
  END IF;
  IF NEW.amount_to_add < 0 THEN
    SET NEW.amount_to_add = 0;
  END IF;
END;
