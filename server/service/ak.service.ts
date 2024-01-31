import { AkModel } from '@/server/models/dao/ak.model';
import { getEnumTypeValueByKey, checkEnumTypeExist } from '@/server/utils';
import { AKTypeEnum, CertDNSTypeLabelEnum } from "@/server/enum";
import { AkCreateDTO, AkUpdateDTO } from '@/server/models/dto/ak.dto';

export class AkService {

    // 获取 ak 列表数据
    async readAkList() { 
        const result = await AkModel.findAll({
            attributes: { 
                exclude: ['key_secret'] 
            },
            order: [
                ['id', 'DESC']
            ]
        });
        result.forEach(val => {
            val.setDataValue('dns_type_label', getEnumTypeValueByKey(CertDNSTypeLabelEnum, val.getDataValue('dns_type')));
        })
        return result;
    }

    // 添加记录
    async createRecord (params: AkCreateDTO) {
        let addData: AkCreateDTO = {...params}
        if (!addData.alias) {
            throw new Error('alias 不能为空');
        }
        if (!addData.key_id || !addData.key_secret) {
            throw new Error('key_id 和 key_secret 不能为空');
        }
        if (!checkEnumTypeExist(AKTypeEnum, addData.dns_type)) {
            throw new Error('请选择 DNS 厂商');
        }
        const result = await AkModel.create(addData);
        return result;
    }
    
    // 编辑记录
    async updateRecord (params: AkUpdateDTO) {
        let updateData: AkUpdateDTO = {...params};
        if(!updateData.id) {
            throw new Error('id 参数不能为空');
        }
        if (!updateData.alias) {
            throw new Error('alias 不能为空');
        }
        if (!updateData.key_id || !updateData.key_secret) {
            throw new Error('key_id 和 key_secret 不能为空');
        }
        if (!checkEnumTypeExist(AKTypeEnum, updateData.dns_type)) {
            throw new Error('请选择 DNS 厂商');
        }
        const result = await AkModel.update(updateData, {
            where: {
                id: updateData.id
            }
        });
        return result;
    }    
    
    // 删除记录
    async deleteRecord (id: number) {
        if(!id) {
            throw new Error('id 参数不能为空');
        }
        // 不存在就返回说明删除成功
        const rowData:any = await AkModel.findByPk(id);
        if (rowData === null) {
            return true;
        }
        const result = await AkModel.destroy({
            where: {
                id: id
            }
        });
        return result;
    }

    // 依据 id 获取信息
    async getKeyAndSecretById (id: number) {
        if(!id) {
            throw new Error('id 参数不能为空');
        }
        // 不存在就返回说明删除成功
        const rowData:any = await AkModel.findByPk(id);
        if (rowData === null) {
            throw new Error('数据异常，获取AK失败');
        }
        return {
            key_id: rowData.key_id,
            key_secret: rowData.key_secret
        }
    }
}