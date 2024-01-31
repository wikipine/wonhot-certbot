/*
 Navicat Premium Data Transfer

 Source Server         : 127.0.0.1
 Source Server Type    : MySQL
 Source Server Version : 50732
 Source Host           : localhost:3306
 Source Schema         : wonhot

 Target Server Type    : MySQL
 Target Server Version : 50732
 File Encoding         : 65001

 Date: 01/02/2024 00:35:22
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for wh_aks
-- ----------------------------
DROP TABLE IF EXISTS `wh_aks`;
CREATE TABLE `wh_aks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `alias` varchar(32) DEFAULT NULL COMMENT '别名',
  `dns_type` varchar(16) DEFAULT NULL COMMENT 'dns厂商',
  `key_id` varchar(255) DEFAULT NULL COMMENT 'access key id',
  `key_secret` varchar(255) DEFAULT NULL COMMENT 'access key secret',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COMMENT='云厂商AK表';

-- ----------------------------
-- Table structure for wh_certs
-- ----------------------------
DROP TABLE IF EXISTS `wh_certs`;
CREATE TABLE `wh_certs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `domain` text COMMENT '域名',
  `domain_cert` varchar(255) DEFAULT NULL COMMENT '证书域名',
  `email` varchar(128) DEFAULT NULL COMMENT '邮箱',
  `dns_type` varchar(16) DEFAULT NULL COMMENT 'dns厂商',
  `ak_id` int(10) DEFAULT NULL COMMENT 'ak 关联 id',
  `status` tinyint(1) unsigned DEFAULT '0' COMMENT '状态',
  `expired_at` timestamp NULL DEFAULT NULL COMMENT '到期时间',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COMMENT='证书记录表';

-- ----------------------------
-- Table structure for wh_ssh_servers
-- ----------------------------
DROP TABLE IF EXISTS `wh_ssh_servers`;
CREATE TABLE `wh_ssh_servers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `alias` varchar(32) DEFAULT NULL COMMENT '别名',
  `host_name` varchar(128) DEFAULT NULL COMMENT 'host name',
  `user_name` varchar(255) DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) DEFAULT NULL COMMENT '登录密码',
  `port` int(3) DEFAULT NULL COMMENT '端口',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COMMENT='SSH Servers配置表';

SET FOREIGN_KEY_CHECKS = 1;
