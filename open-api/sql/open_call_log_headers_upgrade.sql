ALTER TABLE open_call_log
  ADD COLUMN req_headers TEXT NULL AFTER method,
  ADD COLUMN resp_headers TEXT NULL AFTER resp_code;
