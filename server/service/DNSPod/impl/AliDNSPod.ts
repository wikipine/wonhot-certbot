/**
 * 阿里云DNSPod实现 (旧版SDK实现)
 * 文档中心：https://help.aliyun.com/zh/dns/quick-start-1?spm=a2c4g.11186623.0.0.11d3706c0y1HQv
 */
import { DNSPodInterface } from "../interface";
import Core from "@alicloud/pop-core";
import { DNSRecordType, DomainRecordsResponse } from "../type";

export class AliDNSPod implements DNSPodInterface {
  private accessKeyId = "";
  private accessSecret = "";

  constructor(accessKeyId: string, keySecret: string) {
    this.accessKeyId = accessKeyId;
    this.accessSecret = keySecret;
  }

  private _getClientInstance() {
    return new Core({
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessSecret,
      endpoint: "https://alidns.aliyuncs.com",
      apiVersion: "2015-01-09",
    });
  }

  getDomainRecord(domain: string, rr: string): Promise<DomainRecordsResponse> {
    return new Promise<DomainRecordsResponse>((resolve, reject) => {
      const instance = this._getClientInstance();
      let params = {
        DomainName: domain,
      };
      instance.request("DescribeDomainRecords", params).then((res: any) => {
        let dataList: DNSRecordType[] = [];
        res.DomainRecords.Record.forEach((item: any) => {
            dataList.push({
                recordId: item.RecordId,
                domain: item.DomainName,
                rr: item.RR,
                value: item.Value,
                createTime: item.CreateTimestamp,
                updateTime: item.UpdateTimestamp,
                ttl: item.TTL,
                type: item.Type,
                weight: item.Weight,
                status: item.Status
            })
        })
        const result: DomainRecordsResponse = {
            list: dataList,
            current: res.PageNumber,
            pageSize: res.PageSize,
            total: res.TotalCount,
            requestId: res.RequestId,
            originData: res
        }
        return resolve(result);
      }).catch(err => reject(err));
    });
  }

  addDomainRecord(domain: string, rr: string, type: string, value: string): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      const instance = this._getClientInstance();
      const params = {
        DomainName: domain,
        RR: rr,
        Type: type,
        Value: value,
      };
      instance.request("AddDomainRecord", params).then((res: any) => {
        if(res && res.RecordId) {
          return resolve(true)
        } else {
          return resolve(false)
        }
      }).catch(err => reject(err));
    });
  }

  deleteDomainRecord(recordId: number, domain: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const instance = this._getClientInstance();
      const params = {
        RecordId: recordId,
      };
      instance.request("DeleteDomainRecord", params).then((res) => {
        return resolve(res);
      }).catch(err => reject(err));
    });
  }
}
