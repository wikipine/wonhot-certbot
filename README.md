# WONHOT 证书运维系统

纯NodeJS + Certbot 实现 HTTPS 自由，支持通配符证书

## 项目背景
1. 想白嫖
2. 每次更新太麻烦

## 适用人群
个人 & 小团体（只有一个运维的时候），建议只在本地运行。项目未开发鉴权功能，同时涉及到服务器等资产

## 功能
 1. 支持**阿里云，腾讯云**的域名证书生成，其他环境没账号测试，就没开放对应配置
 2. 支持生成的**证书上传到任意云服务器（不限制厂商）**
 3. 后面考虑纯 NodeJS 版本，不依赖 其他环境 ，已实现了腾讯云的SDK导入（暂时没用到）

## 感谢
证书申请核心使用了下面的项目
https://github.com/ywdblog/certbot-letencrypt-wildcardcertificates-alydns-au

PS: 源码中仅保留了 python 部分, 改造腾讯云API3.0后, 不想维护PHP部分，就删除了PHP, 考虑到运维同学大部分会python但不一定会PHP。如需要PHP，请上述项目。

## 开发 & 运行环境
1. Linux(Mac)
2. Certbot (证书依据此方式生成)
3. NodeJS 18
4. Mysql 8
5. Python（2.7 或 3 均可，主要是运行证书生成脚本）
6. zip(压缩包命令)
7. 拥有可执行权限（一般来说没问题，主要涉及到命令执行）

## 配置项 Env

可查看根目录的 env 文件，里面包含数据库相关的配置

mysql 目录下有初始化 sql 文件


## 其他说明
1. 阿里云需要 AccessKey 访问权限
[按照此方法处理](https://help.aliyun.com/zh/ram/user-guide/create-an-accesskey-pair)
并注意需要 添加 **AliyunDNSFullAccess** 权限

