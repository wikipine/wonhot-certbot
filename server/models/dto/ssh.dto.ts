/**
 * 创建传参
 */
export type SSHCreateDTO = {
    alias: string;
    host_name: string;
    user_name: string;
    password: string;
    port: number;
}

/**
 * 编辑传参
 */
export type SSHUpdateDTO = {
    id: number;
    alias: string;
    host_name: string;
    user_name: string;
    password: string;
    port: number;
}