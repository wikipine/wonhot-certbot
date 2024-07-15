/**
 * 工厂类DNSPod
 */
import { AKTypeEnum } from "@/server/enum";
import { AliDNSPod } from "./impl/AliDNSPod";
import { TxyDNSPod } from "./impl/TxyDNSPod";
import cheerio from 'cheerio';
import querystring from 'querystring';

export class DNSPodFactory {
  
  /**
   * 获取实例
   * @param dnsType 
   * @param accessKeyId 
   * @param accessSecret 
   * @returns 
   */
  static create(dnsType: string, accessKeyId: string, accessSecret: string) {
    switch (dnsType) {
      case AKTypeEnum.TXY:
        return new TxyDNSPod(accessKeyId, accessSecret);
      case AKTypeEnum.ALY:
        return new AliDNSPod(accessKeyId, accessSecret);
      default:
        throw new Error("暂不支持类型【" + dnsType + "】");
    }
  }

  /**
   * 获取域名解析记录
   * 模拟请求 google toolbox 可能会失败，受限于墙或者google自身的安全机制
   */
  static async getDomainDnsRecord(domain: string, rr: string) {
    try {
        const _domain = `${rr}.${domain}`;
        // 1.提取csrfToken + cookies
        const originUrl = `https://toolbox.googleapps.com/apps/dig/#TXT/${_domain}`;
        const originResponse = await fetch(originUrl);
        const originText = await originResponse.text();
        const $ = cheerio.load(originText);
        const csrfToken = $('#dig-form input[name="csrfmiddlewaretoken"]').val();
        if(!csrfToken) {
            throw new Error("获取token失败");
        }
        // 获取cookies csrfToken
        const cookies = originResponse.headers.getSetCookie();
        const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
        // 2. 提交请求获取TXT记录
        const requestParams = {
            csrfmiddlewaretoken: csrfToken,
            domain: _domain,
            typ: 'TXT'
        }
        const postResponse = await fetch('https://toolbox.googleapps.com/apps/dig/lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': originUrl, // 设置 Referer 头部
                'Cookie': cookieHeader // Set the cookie header
            },
            body: querystring.stringify(requestParams)
        })
        const result = await postResponse.json();
        if(!result) {
            throw new Error("获取内容失败");
        }
        // 返回answer结果
        return result.json_response.ANSWER;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
