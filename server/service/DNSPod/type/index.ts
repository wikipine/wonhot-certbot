/**
 * DNS记录类型
 */
export type DNSRecordType = {
  recordId: string | number;
  domain: string;
  rr: string;
  value: string;
  createTime?: number | string;
  updateTime: number | string;
  ttl: number;
  type: string;
  weight: number;
  status: string;
};

/**
 * DNS记录返回类型
 */
export type DomainRecordsResponse = {
  list: DNSRecordType[];
  current?: number;
  pageSize?: number;
  total?: number;
  requestId?: string;
  originData: any;
};
