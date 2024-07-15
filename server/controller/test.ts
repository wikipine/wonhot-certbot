import { H3Event } from "h3";
import { responseError, responseSuccess } from "@/server/utils";
import { AkService } from "@/server/service/ak.service";
import { DNSPodFactory } from "@/server/service/DNSPod";


// 获取域名记录
export const getDomainRecord = async (evt: H3Event) => {
  try {
    let { akId, domain } = getQuery(evt);
    if (!akId) {
      return responseError(-1, "akId 参数不能为空");
    }
    if (!domain) {
      return responseError(-1, "domain 参数不能为空");
    }
    // 检查一下 AK 数据
    const akService = new AkService();
    const { key_id, key_secret, dns_type } = await akService.getKeyAndSecretById(akId as number);
    if (!key_id || !key_secret) {
      return responseError(-1, "云厂商AK数据异常");
    }
    const dnsPodInstance = DNSPodFactory.create(dns_type, key_id, key_secret);
    const res = await dnsPodInstance.getDomainRecord(domain as string, "");
    return responseSuccess(res);
  } catch (err: any) {
    return responseError(500, err.message);
  }
};

// 删除记录
export const deleteDomainRecord = async (evt: H3Event) => {
  try {
    const body = await readBody(evt);
    let { akId, recordId, domain } = body;
    if (!akId) {
      return responseError(-1, "akId 参数不能为空");
    }
    if (!recordId) {
      return responseError(-1, "recordId 参数不能为空");
    }
    if (!domain) {
      return responseError(-1, "domain 参数不能为空");
    }
    // 检查一下 AK 数据
    const akService = new AkService();
    const { key_id, key_secret, dns_type } = await akService.getKeyAndSecretById(akId as number);
    if (!key_id || !key_secret) {
      return responseError(-1, "云厂商AK数据异常");
    }
    const dnsPodInstance = DNSPodFactory.create(dns_type, key_id, key_secret);
    const res = await dnsPodInstance.deleteDomainRecord(recordId, domain);
    return responseSuccess(res);
  } catch (err: any) {
    return responseError(500, err.message);
  }
};

// 添加解析记录
export const addDomainRecord = async (evt: H3Event) => {
  try {
    const body = await readBody(evt);
    let { akId, domain, rr, type, value } = body;
    if (!akId || !domain || !rr || !type || !value) {
      return responseError(-1, "参数不能为空");
    }
    // 检查一下 AK 数据
    const akService = new AkService();
    const { key_id, key_secret, dns_type } = await akService.getKeyAndSecretById(akId as number);
    if (!key_id || !key_secret) {
      return responseError(-1, "云厂商AK数据异常");
    }
    const dnsPodInstance = DNSPodFactory.create(dns_type, key_id, key_secret);
    const res = await dnsPodInstance.addDomainRecord(domain, rr, type, value);
    return responseSuccess(res);
  } catch (err: any) {
    return responseError(500, err.message);
  }
};

// 校验解析记录
export const checkDomainRecord = async (evt: H3Event) => {
  try {
    const body = await readBody(evt);
    let { domain } = body;
    if (!domain) {
      return responseError(-1, "domain 参数不能为空");
    }
    const result = await DNSPodFactory.getDomainDnsRecord(domain, '_acme-challenge');
    return responseSuccess(result);
  } catch (err: any) {
    return responseError(500, err.message);
  }
};
