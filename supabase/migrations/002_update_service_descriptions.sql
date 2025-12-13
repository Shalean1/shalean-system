-- Migration: Update existing services with descriptions
-- Created: 2025-12-13
-- Description: Add descriptions to existing popular services

-- Update existing services with descriptions
UPDATE popular_services SET description = 'Regular home cleaning to keep your space fresh and tidy' WHERE slug = 'standard-cleaning';
UPDATE popular_services SET description = 'Get your home ready for the holidays with our thorough cleaning service' WHERE slug = 'holiday-cleaning';
UPDATE popular_services SET description = 'Professional office cleaning to maintain a productive workspace' WHERE slug = 'office-cleaning';
UPDATE popular_services SET description = 'Intensive cleaning for every corner of your home or office' WHERE slug = 'deep-cleaning';
UPDATE popular_services SET description = 'Make your new space spotless before moving in' WHERE slug = 'move-in-cleaning';
