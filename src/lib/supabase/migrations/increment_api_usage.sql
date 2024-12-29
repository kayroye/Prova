CREATE OR REPLACE FUNCTION increment_api_usage(p_user_id UUID, p_period DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO api_usage (user_id, period, count)
    VALUES (p_user_id, p_period, 1)
    ON CONFLICT (user_id, period)
    DO UPDATE SET count = api_usage.count + 1;
END;
$$ LANGUAGE plpgsql; 