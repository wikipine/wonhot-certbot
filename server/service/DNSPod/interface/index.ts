import { DomainRecordsResponse } from "../type";
/**
 * DNSPodInterface
 */
export interface DNSPodInterface {
    
    /**
     * 查询域名解析记录
     * @param domain 域名
     */
    getDomainRecord(domain: string, rr: string): Promise<DomainRecordsResponse>;

    /**
     * 添加域名解析记录
     * @param domain 域名
     * @param rr 子域名
     * @param type 解析类型
     * @param value 解析值
     */
    addDomainRecord(domain: string, rr: string, type: string, value: string): Promise<Boolean>;

    /**
     * 删除域名解析记录
     * @param recordId 
     * @param domain 
     */
    deleteDomainRecord(recordId: number, domain: string): Promise<any>;
}