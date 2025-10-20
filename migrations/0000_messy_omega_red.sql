CREATE TABLE `analysis_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`endpoint_type` text NOT NULL,
	`input_text` text NOT NULL,
	`context` text,
	`explanation` text NOT NULL,
	`risk_level` text NOT NULL,
	`created_at` integer NOT NULL
);
