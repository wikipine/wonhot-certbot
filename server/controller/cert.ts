import { H3Event } from 'h3';
import { CertModel } from '~/server/models/dao/cert.model';
import { 
    responseError, 
    responseSuccess, 
    execCommand, 
    validateEmail, 
    checkEnumTypeExist, 
    getEnumTypeValueByKey, 
    checkCertFileExistSync,
    compressFolderSync
} from '../utils';
import { CertStatusEnum, CertDNSTypeEnum, CertDNSTypeLabelEnum } from "../enum";
import { AkService } from '@/server/service/ak.service';
import { SSHService } from '@/server/service/ssh.service';


/**
 * 获取证书列表
 * @param page 当前页码
 * @param pageSize 每页显示数量
 * @returns 返回证书列表及分页信息
 */
export const getCertList = async (evt: H3Event) => {
    try {
        let { page, pageSize } = getQuery(evt);
        pageSize = pageSize ? Number(pageSize) : 20;
        page = page ? Number(page) : 1;
        const { count, rows } = await CertModel.findAndCountAll({
            order: [
                ['id', 'DESC']
            ],
            limit: pageSize,
            offset: (page - 1) * pageSize
        });
        rows.forEach(cert => {
            cert.setDataValue('dns_type_label', getEnumTypeValueByKey(CertDNSTypeLabelEnum, cert.getDataValue('dns_type')));
        });
        return responseSuccess({
            total: count,
            page: page,
            pageSize: pageSize,
            list: rows
        });
    } catch (err:any) {
        return responseError(500, err.message);
    }
}

// 添加证书记录
export const addCertRecord = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        let addData:any = {
            email: body.email,
            dns_type: body.dns_type,
            ak_id: 0,
            status: CertStatusEnum.INIT
        }
        if(!body.domain) {
            return responseError(-1, 'domain 参数不能为空');
        }
        if(!body.email || !validateEmail(body.email)) {
            return responseError(-1, 'email 格式非法');
        }
        if(!checkEnumTypeExist(CertDNSTypeEnum, body.dns_type)) {
            return responseError(-1, '请选择 DNS 厂商');
        }
        // 重组并过滤域名
        let domainArr = body.domain.split(',');
        domainArr.forEach((val:string)=>{
            val = val.trim();
        })
        addData['domain'] = domainArr.join(',');
        addData['domain_cert'] = domainArr[0].replace('*.', '');
        // dns_config 配置
        if(body.dns_type !== CertDNSTypeEnum.MANUAL) {
            if(!body.ak_id) {
                return responseError(-1, '请选择云厂商AK');
            }
            const akService = new AkService();
            // 检查一下数据
            const { key_id, key_secret } = await akService.getKeyAndSecretById(body.ak_id);
            if(!key_id || !key_secret) {
                return responseError(-1, '云厂商AK数据异常');
            }
            addData.ak_id = body.ak_id;
            // 查询是否存在相同的 domain_cert, 同一个domain_cert可能会影响最后文件的目录，故这里提前排除
            const sameRow:any = await CertModel.findOne({ where: { domain_cert: addData['domain_cert']}});
            if (sameRow !== null) {
                return responseError(-1, '存在相同的domain_cert ' + domainArr[0]);
            }
        } else {
            // 手动模式直接标记成功
            addData.status = CertStatusEnum.SUCCESS;
        }

        const result = await CertModel.create(addData);
        return responseSuccess(result);
    } catch (err:any) {
        return responseError(500, err.message);
    }
};

// 删除证书记录
export const deleteCertRecord = async (evt: H3Event) => {
    try {
        const body = await readBody(evt);
        if(!body.id) {
            return responseError(-1, 'id 参数不能为空');
        }
        // 不存在就返回说明删除成功
        const rowData:any = await CertModel.findByPk(body.id);
        if (rowData === null) {
            return responseSuccess(true);
        }
        // 非手动模式先尝试删除一下文件
        if(rowData.dns_type != CertDNSTypeEnum.MANUAL) {
            const domainArr = rowData.domain.split(',');
            const dirName = domainArr[0].replace('*.', '');
            execCommand('rm', ['-rf', './logs/cert/live/' + dirName]);
            execCommand('rm', ['-rf', './logs/cert/archive/' + dirName]);
            execCommand('rm', ['-rf', './logs/cert/renewal/' + dirName + '.conf']);
        }
        const result = await CertModel.destroy({
            where: {
                id: body.id
            }
        });
        return responseSuccess(result);
    } catch (err:any) {
        return responseError(500, err.message);
    }
};

// 执行证书生成脚本
export const handleCertCreate = async (evt: H3Event) => {
    try {
        // 1 检查数据是否正常
        const body = await readBody(evt);
        if(!body.id) {
            return responseError(-1, 'id 参数不能为空');
        }
        const rowData:any = await CertModel.findByPk(body.id);
        if (rowData === null) {
            return responseError(-1, '数据不存在或已被删除');
        }
        const { id, domain, email, dns_type, ak_id } = rowData;
        const domainArr = domain.split(',');
        if(!domain || !email || !checkEnumTypeExist(CertDNSTypeEnum, dns_type) || !ak_id) {
            return responseError(-1, '参数数据异常，请联系管理员');
        }
        if(dns_type === CertDNSTypeEnum.MANUAL) {
            return responseError(-1, '手动模式不可执行自动化脚本');
        }
        // 依据ak_id 从云厂商AK service 中 获取对应的key 和 密钥
        const akService = new AkService();
        const { key_id, key_secret } = await akService.getKeyAndSecretById(ak_id);
        if(!key_id || !key_secret) {
            return responseError(-1, 'key_id 或 key_secret 为空');
        }
        const config = useRuntimeConfig();
        const addhook = [config.public.VITE_PYTHON_CMD_PATH, 'python', dns_type, 'add', key_id, key_secret];
        const cleanhook = [config.public.VITE_PYTHON_CMD_PATH, 'python', dns_type, 'clean', key_id, key_secret];
        // 2 检查环境配置
        const version = execCommand('certbot', ['--version']);
        if(!version.status) {
            return responseError(-1, 'certbot 环境未配置');
        }
        // 删除存在的日志文件，只保留最近一次
        execCommand('rm', ['-rf', './logs/cert/letsencrypt.log.*']);
        // 3 生成脚本参数
        let params = ['certonly'];
        params.push('--email ' + email);
        domainArr.forEach((val:string) => {
            params.push('-d ' + val);
        });
        params = params.concat([
            '--manual',
            '--manual-auth-hook "./shell/manual-hook/au.sh ' + addhook.join(' ') + '"',
            '--manual-cleanup-hook "./shell/manual-hook/au.sh ' + cleanhook.join(' ') + '"',
            '--preferred-challenges',
            'dns',
            '--server',
            'https://acme-v02.api.letsencrypt.org/directory',
            '--config-dir',
            './logs/cert',
            '--work-dir',
            './logs/cert',
            '--logs-dir',
            './logs/cert',
            '--non-interactive',
            '--agree-tos',
        ]);
        const res = execCommand('certbot', params);
        if(res.stdout.indexOf("Certificate not yet due for renewal") != -1) {
            return responseError(-1, '当前证书未过期，无需重新生成');
        }
        if(res.stdout.indexOf('Successfully received certificate') != -1) {
            let updateData = {
                expired_at : new Date().getTime() + 86400 * 30 * 3 * 1000,
                status: CertStatusEnum.SUCCESS
            }
            await CertModel.update(updateData, {
                where: {
                    id: id
                }
            });
            return responseSuccess(true);
        } else {
            return responseError(-1, res.stderr + '[' + res.completeCommand + ']');
        }
    } catch (err:any) {
        return responseError(500, err.message);
    }
};

// 执行证书下载
export const handleCertDownload = async (evt: H3Event) => {
    try {
        // 1 检查数据是否正常
        const body = await readBody(evt);
        if(!body.id) {
            return responseError(-1, 'id 参数不能为空');
        }
        const rowData:any = await CertModel.findByPk(body.id);
        if (rowData === null) {
            return responseError(-1, '数据不存在或已被删除');
        }
        // 删除文件
        // 2 检查证书文件是否存在
        const dirPath = checkCertFileExistSync(rowData.domain);
        if(!dirPath) {
            return responseError(-1, '证书文件异常, 无法下载');
        }
        // 3 生成压缩包，提供下载地址
        const downloadPath = '/download/cert_' + body.id + '.zip';
        const filePath = './public' + downloadPath;
        execCommand('rm', ['-rf', filePath]);
        await compressFolderSync(dirPath, filePath);
        return responseSuccess(downloadPath);
    } catch (err:any) {
        return responseError(500, err.message);
    }
};

// 执行证书上传到服务器
export const handleCertUpload = async (evt: H3Event) => {
    try {
        // 1 检查数据是否正常
        const body = await readBody(evt);
        const { cert_id, server_id, server_dir } = body;
        if(!cert_id || !server_id || !server_dir) {
            return responseError(-1, '参数异常');
        }
        const rowData:any = await CertModel.findByPk(cert_id);
        if (rowData === null) {
            return responseError(-1, '数据不存在或已被删除');
        }
        // 2 检查证书文件是否存在
        const dirPath = checkCertFileExistSync(rowData.domain);
        if(!dirPath) {
            return responseError(-1, '证书文件异常, 无法上传');
        }
        // 3 生成压缩包，提供下载地址
        const fileName = 'cert_' + cert_id + '.zip';
        const downloadPath = '/download/' + fileName;
        const filePath = './public' + downloadPath;
        execCommand('rm', ['-rf', filePath]);
        await compressFolderSync(dirPath, filePath);
        // 4 通过 ssh 上传到 对应服务器
        const sshService = new SSHService();
        await sshService.uploadFile(server_id, filePath, server_dir + '/' + fileName);
        return responseSuccess(null);
    } catch (err:any) {
        return responseError(500, err.message);
    }
};