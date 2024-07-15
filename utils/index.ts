import dayjs from "dayjs";

/**
 * 格式化时间
 */
export const formatDateTime = (time: number, formatStr: string) => {
    return dayjs(time).format(formatStr ? formatStr : 'YYYY.MM.DD');
}

/**
 * 获取剩余天数
 */
export const getDaysRemaining = (time: string) => {
    // 获取当前日期
    const currentDate = new Date();
    // 设置到期日期
    const expirationDate = new Date(time);
    // 计算日期之间的差异（以毫秒为单位）
    const timeDifference = expirationDate.getTime() - currentDate.getTime();
    // 将毫秒转换为天数
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

/**
 * 获取 _acme-challenge.${domain} 的解析记录
 * @param domain 
 */
export const getAcmeTxtRecord = async (domain: string) => {
    const url = `https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.${domain}`;
    try {
        const { data } = await useFetch(url);
    
        console.log(data.value);

      } catch (error) {
        console.error('Error fetching TXT record:', error);
      }
}