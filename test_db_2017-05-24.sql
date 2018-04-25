# Dump of table blog_posts
# ------------------------------------------------------------

DROP TABLE IF EXISTS `blog_posts`;

CREATE TABLE `blog_posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `author` int(11) unsigned DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `blog_posts` WRITE;

INSERT INTO `blog_posts` (`id`, `author`, `title`, `content`, `created_at`, `updated_at`)
VALUES
	(1,2,'First Post','Hello world','2017-03-08 14:10:36','2017-04-10 14:10:36'),
	(2,2,'Second Post','Hello, again!','2017-03-09 14:10:36','2017-03-10 14:10:36'),
	(3,3,'This is my post','It is nice','2017-03-10 12:10:00','2017-03-10 12:10:00');

UNLOCK TABLES;

# Dump of table user_addresses
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_addresses`;

CREATE TABLE `user_addresses` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `user_addresses` WRITE;

INSERT INTO `user_addresses` (`id`, `user_id`, `address`, `province`, `city`, `country`, `postal_code`)
VALUES
	(1,1,'123 fake street','Ontario','Ottawa','Canada','123 w4t'),
	(2,2,'123 queen street','Quebec','Gatineau','Canada','123 tdf'),
	(3,3,'123 major road','Ontario','Ottawa','Canada','145 w4t'),
	(4,4,'123 blue street','Ontario','Ottawa','Canada','145 lpo');

UNLOCK TABLES;

# Dump of table user_roles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_roles`;

CREATE TABLE `user_roles` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `user_roles` WRITE;

INSERT INTO `user_roles` (`id`, `label`)
VALUES
	(1,'Admin'),
	(2,'Publisher'),
	(3,'Public User');

UNLOCK TABLES;

# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_roles_id` int(11) unsigned DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `users` WRITE;

INSERT INTO `users` (`id`, `user_roles_id`, `username`, `email`)
VALUES
	(1,1,'I_Admin','admin@test.com'),
	(2,2,'I_Publish','publisher@test.com'),
	(3,3,'I_Use','user@test.com'),
	(4,3,'I_Use_Too','user2@test.com');

UNLOCK TABLES;