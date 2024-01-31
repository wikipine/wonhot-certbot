/**
 * 创建传参
 */
export type AkCreateDTO = {
    alias: string;
    dns_type: string;
    key_id: string;
    key_secret: string;
}

/**
 * 编辑传参
 */
export type AkUpdateDTO = {
    id: number;
    alias: string;
    dns_type: string;
    key_id: string;
    key_secret: string;
}