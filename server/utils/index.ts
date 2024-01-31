import { spawnSync } from 'child_process';
import crypto from 'crypto';
import dns from "dns";
import fs from "fs";


/**
 * 成功返回
 */
export const responseSuccess = (data: any) => {
    return {
        success: true,
        errorCode: 0,
        errorInfo: 'No Error!',
        data
    }
}

/**
 * 失败返回
 */
export const responseError = (errorCode: number, errorInfo: string) => {
    return {
        success: false,
        errorCode,
        errorInfo: errorInfo ?? 'UnKnown Error',
        data: null
    }
}

/**
 * 执行脚本命令
 */
export const execCommand = (command: string, args: any[]) => {
    const res = spawnSync(command, args, { shell: true });
    const stdout = res.stdout.toString('utf-8');
    const stderr = res.stderr.toString('utf-8');
    const completeCommand = command + ' ' + args.join(' ');
    const result = {
        status: false,
        stdout,
        stderr,
        completeCommand
    };
    // 说明执行失败，返回错误
    if (res.pid === 0 || stderr) {
        return result;
    }
    result['status'] = true;
    return result;
}

/**
 * 获取随机的16进制符号
 */
export const getRandomHex = (length: number) => {
    const randomBytes = crypto.randomBytes(length);
    return randomBytes.toString('hex');
}

/**
 * 验证邮箱
 */
export const validateEmail = (email: string) => {
    const emailRegex = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z]{2,4})+$/;
    if (emailRegex.test(email)) {
        return true;
    } else {
        return false;
    }
}

/**
 * 检查DNS状态
 */
export const checkDNSStatus = (domain: string) => {
    return new Promise((resolve, reject) => {
        dns.resolveTxt(domain, (error: any, records: unknown) => {
            if (error) {
                reject(error);
            } else {
                resolve(records);
            }
        });
    })
}

/**
 * 检查Enum类型的数据存在
 */
export const checkEnumTypeExist = (EnumObject: Record<string | number, any>, value: any) => {
    return Object.values(EnumObject).includes(value);
}

/**
 * Enum类型 
 * 依据key返回value
 */
export const getEnumTypeValueByKey = (EnumObject: Record<string | number, any>, key: string | number) => {
    return EnumObject[key] || null;
}

/**
 * 同步检查证书文件是否存在
 */
export const checkCertFileExistSync = (domain: string) => {
    const domainArr = domain.split(',');
    const dirName = domainArr[0].replace('*.', '');
    const dirPath = './logs/cert/live/' + dirName;
    const fileList = ['cert.pem', 'chain.pem', 'fullchain.pem', 'privkey.pem'];
    // 只要检查到一个文件不存在那么就判定证书异常
    for (let i = 0; i < fileList.length; i++) {
        if (!fs.existsSync(dirPath + '/' + fileList[i])) {
            return false
        }
    }
    return dirPath;
}

/**
 * 压缩文件夹下的内容
 * @param sourceFolder 
 * @param outputFilePath 
 * @returns 
 */
export const compressFolderSync = async (sourceFolder: string, outputFilePath: string) => {
    execCommand('zip', [
        '-jr',
        outputFilePath,
        sourceFolder
    ]);
    // const output = fs.createWriteStream(outputFilePath);
    // const archive = archiver('zip', {
    //     zlib: { level: 9 } // 设置压缩级别
    // });
    // return new Promise((resolve, reject) => {
    //     output.on('close', () => {
    //         console.log('success');
    //         resolve(true);
    //     });

    //     archive.on('error', (err) => {
    //         console.log('error zip', err);
    //         reject(err);
    //     });

    //     archive.pipe(output);
    //     archive.directory(sourceFolder, false);
    //     archive.finalize();
    // });
}