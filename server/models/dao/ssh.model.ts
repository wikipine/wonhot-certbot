import { DataTypes, Model } from "sequelize";
import { sequelize } from "~~/config/db";

export const SSHModel = sequelize.define('ssh_server', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  alias: {
    type: DataTypes.STRING,
    allowNull: false
  },
  host_name: {
    type: DataTypes.STRING,
  },
  user_name: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  port: {
    type: DataTypes.NUMBER,
  }
})