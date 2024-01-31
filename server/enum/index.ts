/**
 * 证书状态
 */
export enum CertStatusEnum {
    INIT = 0,
    SUCCESS = 1
}

/**
 * 支持的证书DNS方式
 */
export enum CertDNSTypeEnum {
    MANUAL = 'manual',
    ALY = 'aly',
    TXY = 'txy',
    HWY = 'hwy',
    GODADY = 'godaddy'
}

/**
 * 支持的证书DNS方式Label
 * manual = '手动模式',
 * aly = '阿里云',
 * txy = '腾讯云',
 * hwy = '华为云',
 * godaddy = 'Godady'
 */
export enum CertDNSTypeLabelEnum {
    manual = '手动模式',
    aly = '阿里云',
    txy = '腾讯云',
    hwy = '华为云',
    godaddy = 'Godady'
}

/**
 * AK 所支持的厂商
 * ALY = 'aly',
 * TXY = 'txy'
 */
export enum AKTypeEnum {
    ALY = 'aly',
    TXY = 'txy'
}