const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    role: DataTypes.STRING,
  },
  { tableName: "users", timestamps: false }
);

const Car = sequelize.define(
  "Car",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    sold_out: DataTypes.BOOLEAN,
  },
  { tableName: "cars", timestamps: false }
);

const Purchase = sequelize.define(
  "Purchase",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    car_id: DataTypes.INTEGER,
    buyer_name: DataTypes.STRING,
    buyer_email: DataTypes.STRING,
    buyer_phone: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    car_price: DataTypes.DECIMAL(10, 2),
    trade_in_car: DataTypes.STRING,
    trade_in_status: DataTypes.STRING,
    trade_in_value: DataTypes.DECIMAL(10, 2),
    amount_to_add: DataTypes.DECIMAL(10, 2),
    notes: DataTypes.TEXT,
    created_at: DataTypes.DATE,
  },
  { tableName: "purchases", timestamps: false }
);

Purchase.belongsTo(Car, { foreignKey: "car_id", as: "car" });

module.exports = {
  sequelize,
  User,
  Car,
  Purchase,
};

