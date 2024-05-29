import { DataTypes } from "sequelize";
import db from "../db/conection";


const ServicesCategory = db.define('services_category', {
    services_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});


export default ServicesCategory;