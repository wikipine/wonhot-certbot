// 文档中心：https://cloud.tencent.com/document/product/1427/56193
import { DNSPodInterface } from "../interface";
import * as tencentcloud from "tencentcloud-sdk-nodejs";
import { DescribeRecordListRequest, DescribeRecordListResponse } from "tencentcloud-sdk-nodejs/tencentcloud/services/dnspod/v20210323/dnspod_models";

const DNSPodClient = tencentcloud.dnspod.v20210323.Client;

export class TxyDNSPod implements DNSPodInterface {

    private accessKeyId = '';
    private accessSecret = '';

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
                    headers: headers ?? {}
                },
            }
        })
    }

    getDomainRecord(domain: string): Promise<DescribeRecordListResponse> {   
        return new Promise<DescribeRecordListResponse>((resolve, reject) => {
            const instance = this._getClientInstance({
                Action: 'DescribeRecordList'
            })
            let requestParams: DescribeRecordListRequest = {
                Domain: domain
            }
            instance.DescribeRecordList(requestParams).then(res => {
                return resolve(res);
            })
        })
    }

    addDomainRecord(domain: string, subDomain: string, ip: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    deleteDomainRecord(domain: string, recordId: string): Promise<any> {
        throw new Error("Method not implemented.");
    }


}