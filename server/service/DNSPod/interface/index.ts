/**
 * DNSPodInterface
 */
export interface DNSPodInterface {
    
    /**
     * 查询域名解析记录
     * @param domain 
     */
    getDomainRecord(domain: string): Promise<any>;

    /**
     * 添加域名解析记录
     * @param domain 
     * @param subDomain 
     * @param ip 
     */
    addDomainRecord(domain: string, subDomain: string, ip: string): Promise<any>;

    /**
     * 删除域名解析记录
     * @param domain 
     * @param recordId 
     */
    deleteDomainRecord(domain: string, recordId: string): Promise<any>;
}