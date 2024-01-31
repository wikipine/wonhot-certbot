import { SSHModel } from '@/server/models/dao/ssh.model';
import { SSHCreateDTO, SSHUpdateDTO } from '@/server/models/dto/ssh.dto';
import { NodeSSH } from "node-ssh";

export class SSHService {

    // 获取列表数据
    async readList() { 
        const result = await SSHModel.findAll({
            attributes: { 
                exclude: ['password'] 
            },
            order: [
                ['id', 'DESC']
            ]
        });
        return result;
    }
    
    // 通过ID获取记录
    async getRecordById (id: number) { 
        const rowData:any = await SSHModel.findByPk(id);
        if (rowData === null) {
            throw new Error('数据不存在');
        }
        return rowData;
    }

    // 添加记录
    async createRecord (params: SSHCreateDTO) {
        let addData: SSHCreateDTO = {...params}
        if (!addData.alias) {
            throw new Error('alias 不能为空');
        }
        if (!addData.host_name) {
            throw new Error('host不能为空');
        }
        if (!addData.user_name || !addData.password) {
            throw new Error('凭证信息不能为空');
        }
        if(!addData.port) {
            addData.port = 22;
        }
        const result = await SSHModel.create(addData);
        return result;
    }
    
    // 编辑记录
    async updateRecord (params: SSHUpdateDTO) {
        let updateData: SSHUpdateDTO = {...params};
        if(!updateData.id) {
            throw new Error('id 参数不能为空');
        }
        if (!updateData.alias) {
            throw new Error('alias 不能为空');
        }
        if (!updateData.alias) {
            throw new Error('alias 不能为空');
        }
        if (!updateData.host_name) {
            throw new Error('host不能为空');
        }
        if (!updateData.user_name || !updateData.password) {
            throw new Error('凭证信息不能为空');
        }
        if(!updateData.port) {
            updateData.port = 22;
        }
        const result = await SSHModel.update(updateData, {
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
        const rowData:any = await SSHModel.findByPk(id);
        if (rowData === null) {
            return true
        }
        const result = await SSHModel.destroy({
            where: {
                id: id
            }
        });
        return result;
    }

    /**
     * 链接测试
     * @param id 
     * @returns 
     */
    async connectTest(id: number) {
        if(!id) {
            throw new Error('id 参数不能为空');
        }
        // 不存在就返回说明删除成功
        const rowData:any = await SSHModel.findByPk(id);
        if (rowData === null) {
            throw new Error('数据不存在');
        }
        const ssh = new NodeSSH();
        const res = await ssh.connect({
            host: rowData.host_name,
            port: rowData.port,
            username: rowData.user_name,
            password: rowData.password
        })
        ssh.dispose();
        if(res) {
            return true
        } else {
            return false;
        }
    } 
    
    /**
     * 上传文件
     * @param id 
     * @returns 
     */
    async uploadFile(id: number, filePath: string, uploadPath: string) {
        if(!id) {
            throw new Error('id 参数不能为空');
        }
        // 不存在就返回说明删除成功
        const rowData:any = await SSHModel.findByPk(id);
        if (rowData === null) {
            throw new Error('服务器配置不存在');
        }
        const ssh = new NodeSSH();
        const connRes = await ssh.connect({
            host: rowData.host_name,
            port: rowData.port,
            username: rowData.user_name,
            password: rowData.password
        })
        if(!connRes) {
            throw new Error('链接失败请重试');
        }
        await ssh.putFile(filePath, uploadPath);
        ssh.dispose();
        return true;
    }
}