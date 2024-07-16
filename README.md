# WONHOT 证书运维系统

纯NodeJS + Certbot 实现 HTTPS 自由，支持通配符证书

依赖运行版本建议 18.20.4 以上

## 项目背景
穷，不想给 HTTPS 付钱 + 期望能自动化实现证书更新。如微信小程序的证书运维，难道非要人工去更新吗？

## 适用人群
个人 & 小团体（只有一个运维的时候），建议只在本地运行。项目未开发鉴权功能，同时涉及到服务器等资产

## 功能
 1. 支持**阿里云，腾讯云**的域名证书生成，其他环境没账号测试，就没开放对应配置
 2. 支持生成的**证书上传到任意云服务器（不限制厂商）**

## 感谢
参考实现
https://github.com/ywdblog/certbot-letencrypt-wildcardcertificates-alydns-au

后面采用了纯NodeJS实现

## 开发 & 运行环境
1. Linux(Mac)
2. Certbot (证书依据此方式生成)
3. NodeJS 18
4. Mysql 8
6. zip(压缩包命令)
7. 拥有可执行权限（一般来说没问题，主要涉及到命令执行）

## 初始化
1. 使用 yarn 安装依赖 , pnpm 会有问题，估计是某个依赖造成
2. 初始化数据库, 可查看根目录的 env 文件，里面包含数据库相关的配置, mysql 目录下有初始化 sql 文件


## 其他说明
1. 阿里云需要 AccessKey 访问权限
[按照此方法处理](https://help.aliyun.com/zh/ram/user-guide/create-an-accesskey-pair)
并注意需要 添加 **AliyunDNSFullAccess** 权限

