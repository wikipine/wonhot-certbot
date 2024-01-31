import { H3Event } from 'h3';
import { responseError, responseSuccess } from '@/server/utils';
import { AkService } from '@/server/service/ak.service';
import { AkCreateDTO, AkUpdateDTO } from '@/server/models/dto/ak.dto';

// 获取AK信息列表
export const readAkList = async () => {
    try {
        const akService = new AkService();
        const rlt = await akService.readAkList();
        return responseSuccess(rlt);
    } catch (err) {
        return responseError(500, 'Something went wrong');
    }
}

// 创建记录
export const createRecord = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        let params: AkCreateDTO = {
            alias: body.alias,
            dns_type: body.dns_type,
            key_id: body.key_id,
            key_secret: body.key_secret
        }
        const akService = new AkService();
        const rlt = await akService.createRecord(params);
        return responseSuccess(rlt);
    } catch (err: any) {
        return responseError(500, err.message);
    }
}

// 编辑记录
export const updateRecord = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        let params: AkUpdateDTO = {
            id: body.id,
            alias: body.alias,
            dns_type: body.dns_type,
            key_id: body.key_id,
            key_secret: body.key_secret
        }
        const akService = new AkService();
        const rlt = await akService.updateRecord(params);
        return responseSuccess(rlt);
    } catch (err: any) {
        return responseError(500, err.message ?? 'Something went wrong');
    }
}

// 删除记录
export const deleteRecord = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        const akService = new AkService();
        const rlt = await akService.deleteRecord(body.id);
        return responseSuccess(rlt);
    } catch (err) {
        return responseError(500, 'Something went wrong');
    }
}