-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.5.5-10.0.7-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             8.0.0.4396
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping database structure for vchat
CREATE DATABASE IF NOT EXISTS `vchat` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `vchat`;


-- Dumping structure for table vchat.msg
CREATE TABLE IF NOT EXISTS `msg` (
  `MsgId` varchar(50) DEFAULT '0',
  `MsgType` varchar(20) DEFAULT '0',
  `ToUserName` varchar(50) DEFAULT '0',
  `FromUserName` varchar(50) DEFAULT '0',
  `Content` varchar(500) DEFAULT '0',
  `CreateTime` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table vchat.msg: ~1 rows (approximately)
/*!40000 ALTER TABLE `msg` DISABLE KEYS */;
INSERT INTO `msg` (`MsgId`, `MsgType`, `ToUserName`, `FromUserName`, `Content`, `CreateTime`) VALUES
	('6101114396960351473', 'text', 'gh_8c7d1ed02a0c', 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 'a10 10,20,10,30', '1420526392');
/*!40000 ALTER TABLE `msg` ENABLE KEYS */;


-- Dumping structure for table vchat.org
CREATE TABLE IF NOT EXISTS `org` (
  `id` int(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table vchat.org: ~13 rows (approximately)
/*!40000 ALTER TABLE `org` DISABLE KEYS */;
INSERT INTO `org` (`id`, `name`, `type`) VALUES
	(1, '战略发展部', '党群、行政部门'),
	(2, '国际合作与交流处', '党群、行政部门'),
	(3, '校长办公室', '党群、行政部门'),
	(4, '党委学生工作部', '党群、行政部门'),
	(5, '校团委', '党群、行政部门'),
	(6, '离退休工作处', '党群、行政部门'),
	(7, '保卫处', '党群、行政部门'),
	(8, '校园管理处', '党群、行政部门'),
	(9, '校园规划与建设处', '党群、行政部门'),
	(10, '党委组织部', '党群、行政部门'),
	(11, '研究生院', '党群、行政部门'),
	(12, '资产管理处', '党群、行政部门'),
	(13, '纪律检查委员会办公室', '党群、行政部门');
/*!40000 ALTER TABLE `org` ENABLE KEYS */;


-- Dumping structure for table vchat.score
CREATE TABLE IF NOT EXISTS `score` (
  `org_id` int(10) DEFAULT NULL,
  `uid` varchar(50) DEFAULT NULL,
  `score` float DEFAULT NULL,
  `msg_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table vchat.score: ~10 rows (approximately)
/*!40000 ALTER TABLE `score` DISABLE KEYS */;
INSERT INTO `score` (`org_id`, `uid`, `score`, `msg_id`) VALUES
	(10, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 70, '6100845265719637416'),
	(9, 'oMR8gs_lNySfedUBBin9Cd8aBHUo', 466, '6100845909964731863'),
	(10, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 70, '6100846734598452754'),
	(10, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 70, '6101040192810373466'),
	(10, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 70, '6101097079652212747'),
	(7, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 90, '6101112464225068126'),
	(10, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 70, '6101112580189185130'),
	(10, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 70, '6101112678973432949'),
	(10, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 70, '6101114040478065884'),
	(10, 'oMR8gsycPJgCn2PH0RVAvlPd3oCc', 70, '6101114396960351473');
/*!40000 ALTER TABLE `score` ENABLE KEYS */;


-- Dumping structure for table vchat.user
CREATE TABLE IF NOT EXISTS `user` (
  `code` varchar(50) DEFAULT NULL,
  `uid` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table vchat.user: ~0 rows (approximately)
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
