BEGIN;

UPDATE tags SET icon = '🟢' WHERE label = 'Normal' AND log_type = 'stool';
UPDATE tags SET icon = '🟡' WHERE label = 'Soft' AND log_type = 'stool';
UPDATE tags SET icon = '🔴' WHERE label = 'Liquid' AND log_type = 'stool';
UPDATE tags SET icon = '💧' WHERE label = 'Mucus' AND log_type = 'stool';

UPDATE tags SET icon = '🟢' WHERE label = 'Clear' AND log_type = 'urine';
UPDATE tags SET icon = '⚪' WHERE label = 'Light' AND log_type = 'urine';
UPDATE tags SET icon = '🔁' WHERE label = 'Frequent' AND log_type = 'urine';
UPDATE tags SET icon = '🏠' WHERE label = 'Accidents' AND log_type = 'urine';

COMMIT;
