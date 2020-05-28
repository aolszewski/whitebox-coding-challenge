CREATE TABLE rates (
  id int(11) unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  client_id int(11) unsigned NOT NULL,
  start_weight decimal(10,2) DEFAULT NULL,
  end_weight decimal(10,2) DEFAULT NULL,
  zone varchar(1) DEFAULT NULL,
  rate decimal(10,2) DEFAULT NULL,
  shipping_speed varchar(15) DEFAULT NULL,
  locale enum('international','domestic') DEFAULT NULL
);
