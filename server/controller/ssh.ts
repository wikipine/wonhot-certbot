import { H3Event } from 'h3';
import { responseError, responseSuccess } from '@/server/utils';
import { SSHService } from '@/server/service/ssh.service';
import { SSHCreateDTO, SSHUpdateDTO } from '@/server/models/dto/ssh.dto';

// 获取信息列表
export const readList = async () => {
    try {
        const service = new SSHService();
        const rlt = await service.readList();
        return responseSuccess(rlt);
    } catch (err:any) {
        return responseError(500, err.message);
    }
}

// 创建记录
export const createRecord = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        let params: SSHCreateDTO = {
            alias: body.alias,
            host_name: body.host_name,
            user_name: body.user_name,
            password: body.password,
            port: body.port,
        }
        const service = new SSHService();
        const rlt = await service.createRecord(params);
        return responseSuccess(rlt);
    } catch (err: any) {
        return responseError(500, err.message);
    }
}

// 编辑记录
export const updateRecord = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        let params: SSHUpdateDTO = {
            id: body.id,
            alias: body.alias,
            host_name: body.host_name,
            user_name: body.user_name,
            password: body.password,
            port: body.port,
        }
        const service = new SSHService();
        const rlt = await service.updateRecord(params);
        return responseSuccess(rlt);
    } catch (err: any) {
        return responseError(500, err.message);
    }
}

// 删除记录
export const deleteRecord = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        const service = new SSHService();
        const rlt = await service.deleteRecord(body.id);
        return responseSuccess(rlt);
    } catch (err:any) {
        return responseError(500, err.message);
    }
}

// 链接测试
export const connectTest = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        const service = new SSHService();
        const rlt = await service.connectTest(body.id);
        return responseSuccess(rlt);
    } catch (err:any) {
        return responseError(500, err.message);
    }
}