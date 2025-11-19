CREATE TABLE `restaurant` (
  `id` int(11) NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cuisine` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coverimage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` double NOT NULL,
  `avg_price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `restaurant`
(`id`, `name`, `cuisine`, `detail`, `coverimage`, `city`, `rating`, `avg_price`)
VALUES
(1, 'Bangkok Bites', 'Thai',
 'Popular Thai restaurant with classic dishes and street-food style vibe.',
 'https://picsum.photos/seed/restaurant1/800/500',
 'Bangkok', 4.5, 120),
(2, 'Sushi Flow', 'Japanese',
 'Modern sushi bar with omakase and fresh sashimi.',
 'https://picsum.photos/seed/restaurant2/800/500',
 'Bangkok', 4.7, 350),
(3, 'Curry Corner', 'Indian',
 'Comfort-style Indian curries and naan bread, vegetarian-friendly.',
 'https://picsum.photos/seed/restaurant3/800/500',
 'Chiang Mai', 4.2, 180),
(4, 'Veggie Garden', 'Vegetarian',
 'Plant-based menu with salads, bowls, and smoothies.',
 'https://picsum.photos/seed/restaurant4/800/500',
 'Chiang Mai', 4.3, 150),
(5, 'Seaside Grill', 'Seafood',
 'Grilled seafood and Thai fusion dishes near the beach.',
 'https://picsum.photos/seed/restaurant5/800/500',
 'Phuket', 4.4, 300);

ALTER TABLE `restaurant`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `restaurant`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
