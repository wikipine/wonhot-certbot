import { h } from 'vue';
import { Icon } from '#components';

export const menuOptions = [
    {
        label: "证书列表",
        key: "cert",
        icon: () => {
            return h(Icon, { name: 'uil:file-info-alt', size: '18' })
        }
    },
    {
        label: "系统配置",
        key: "setting",
        icon: () => {
            return h(Icon, { name: 'uil:setting', size: '18' })
        },
        children: [
            {
                label: "云厂商AK",
                key: "setting-ak",
            },
            {
                label: "SSH Servers",
                key: "setting-ssh",
            }
        ]
    }
];