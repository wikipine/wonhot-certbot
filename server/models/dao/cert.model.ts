import { DataTypes, Model } from "sequelize";
import { sequelize } from "~~/config/db";

export const CertModel = sequelize.define('cert', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain_cert: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
  },
  dns_type: {
    type: DataTypes.STRING,
  },
  ak_id: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.INTEGER
  },
  expired_at: {
    type: DataTypes.DATE
  }
})