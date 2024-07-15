// 参考案例: https://github.com/hastackdev/nuxt3-blog/tree/master
import { useBase, createRouter, defineEventHandler } from 'h3';

import * as CertController from '~~/server/controller/cert';
import * as AkController from '~~/server/controller/ak';
import * as SSHController from '~~/server/controller/ssh';
import * as TestController from '~~/server/controller/test';

const router = createRouter();

// 证书相关操作
router.get('/cert/list', defineEventHandler(CertController.getCertList));
router.post('/cert/record/add', defineEventHandler(CertController.addCertRecord));
router.post('/cert/record/delete', defineEventHandler(CertController.deleteCertRecord));
router.post('/cert/create', defineEventHandler(CertController.handleCertCreate));
router.post('/cert/download', defineEventHandler(CertController.handleCertDownload));
router.post('/cert/upload', defineEventHandler(CertController.handleCertUpload));

// ak相关操作
router.get('/ak/list', defineEventHandler(AkController.readAkList));
router.post('/ak/record/add', defineEventHandler(AkController.createRecord));
router.post('/ak/record/update', defineEventHandler(AkController.updateRecord));
router.post('/ak/record/delete', defineEventHandler(AkController.deleteRecord));

// ssh相关操作
router.get('/ssh/list', defineEventHandler(SSHController.readList));
router.post('/ssh/record/add', defineEventHandler(SSHController.createRecord));
router.post('/ssh/record/update', defineEventHandler(SSHController.updateRecord));
router.post('/ssh/record/delete', defineEventHandler(SSHController.deleteRecord));
router.post('/ssh/connect/test', defineEventHandler(SSHController.connectTest));

// 测试调试相关操作
router.get('/test/dns/record/list', defineEventHandler(TestController.getDomainRecord));
router.post('/test/dns/record/delete', defineEventHandler(TestController.deleteDomainRecord));
router.post('/test/dns/record/add', defineEventHandler(TestController.addDomainRecord));
router.post('/test/dns/record/check', defineEventHandler(TestController.checkDomainRecord));

export default useBase('/api', router.handler);