/**
 * 腾讯云DNSPod实现
 * 文档中心：https://cloud.tencent.com/document/product/1427/56193
 */
import { DNSPodInterface } from "../interface";
import * as tencentcloud from "tencentcloud-sdk-nodejs";
import {
  DescribeRecordListRequest,
  DescribeRecordListResponse,
  CreateRecordRequest,
  CreateRecordResponse,
  DeleteRecordRequest,
  RecordListItem,
} from "tencentcloud-sdk-nodejs/tencentcloud/services/dnspod/v20210323/dnspod_models";
import { DNSRecordType, DomainRecordsResponse } from "../type";

const DNSPodClient = tencentcloud.dnspod.v20210323.Client;

export class TxyDNSPod implements DNSPodInterface {
  private accessKeyId = "";
  private accessSecret = "";

  constructor(accessKeyId: string, keySecret: string) {
    this.accessKeyId = accessKeyId;
    this.accessSecret = keySecret;
  }

  private _getClientInstance(headers: any) {
    return new DNSPodClient({
      credential: {
        secretId: this.accessKeyId,
        secretKey: this.accessSecret,
      },
      profile: {
        signMethod: "TC3-HMAC-SHA256", // 签名方法
        httpProfile: {
          reqMethod: "POST", // 请求方法
          reqTimeout: 30, // 请求超时时间，默认60s
          headers: headers ?? {},
        },
      },
    });
  }

  getDomainRecord(domain: string, rr: string): Promise<DomainRecordsResponse> {
    return new Promise<DomainRecordsResponse>((resolve, reject) => {
      const instance = this._getClientInstance({
        Action: "DescribeRecordList",
      });
      let requestParams: DescribeRecordListRequest = {
        Domain: domain,
      };
      if (rr && rr.length > 0) {
        requestParams["Subdomain"] = rr;
      }
      instance
        .DescribeRecordList(requestParams)
        .then((res: DescribeRecordListResponse) => {
          let dataList: DNSRecordType[] = [];
          res.RecordList?.forEach((item: RecordListItem) => {
            dataList.push({
              recordId: item.RecordId,
              domain: domain,
              rr: item.Name,
              value: item.Value,
              updateTime: item.UpdatedOn,
              ttl: item.TTL,
              type: item.Type,
              weight: item.Weight,
              status: item.Status,
            });
          });
          const result: DomainRecordsResponse = {
            list: dataList,
            total: res.RecordCountInfo?.TotalCount,
            requestId: res.RequestId,
            originData: res
          };
          return resolve(result);
        })
        .catch((err) => reject(err));
    });
  }

  addDomainRecord(domain: string, rr: string, type: string, value: string): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      const instance = this._getClientInstance({
        Action: "CreateRecord",
      });
      const params: CreateRecordRequest = {
        Domain: domain,
        SubDomain: rr,
        RecordType: type,
        RecordLine: "默认",
        Value: value,
      };
      instance
        .CreateRecord(params)
        .then((res: CreateRecordResponse) => {
          if(res) {
            return resolve(true);
          } else {
            return resolve(false);
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  deleteDomainRecord(recordId: number, domain: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const instance = this._getClientInstance({
        Action: "DeleteRecord",
      });
      const params: DeleteRecordRequest = {
        Domain: domain, // 这里需要传入域名
        RecordId: recordId,
      };
      instance
        .DeleteRecord(params)
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
}
