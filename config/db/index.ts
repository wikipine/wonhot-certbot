import { Sequelize } from 'sequelize';

const config = useRuntimeConfig();
const database = config.public['VITE_MYSQL_DATABASE'];
const host = config.public['VITE_MYSQL_HOST'];
const user = config.public['VITE_MYSQL_USER'];
const password = config.public['VITE_MYSQL_PASSWORD'];
const table_prefix = config.public['VITE_MYSQL_TABLE_PREFIX'];

export const sequelize = new Sequelize(database, user, password, {
    host: host,
    dialect: 'mysql',
    timezone: '+08:00',
    define: {
        paranoid: true, // 启用软删
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    },
    dialectOptions: {
        dateStrings: true,
        typeCast: true
    },
    hooks: {
        beforeDefine: function (columns: any, model: { tableName: string; name: { plural: string; }; }) {
            // 表前缀增加
            model.tableName = table_prefix + '_' + model.name?.plural;
        }
    }
})
