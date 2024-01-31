import { DataTypes, Model } from "sequelize";
import { sequelize } from "~~/config/db";

export const AkModel = sequelize.define('ak', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  alias: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dns_type: {
    type: DataTypes.STRING,
  },
  key_id: {
    type: DataTypes.STRING,
  },
  key_secret: {
    type: DataTypes.STRING,
  }
})