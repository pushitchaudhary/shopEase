import { DATE, DATEONLY } from "sequelize";
import {Table, Model, Column, DataType} from "sequelize-typescript";
import { PAYMENT_METHOD, STATUS } from "../../global/enum/enumFiles";

@Table({
    tableName : 'orders',
    modelName : 'OrderModels',
    timestamps : true
})

class OrderModels extends Model{
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,  // Auto-increment enabled
        allowNull: false
    })
    declare id : string

    @Column({
        type : DATEONLY,
        allowNull : false
    })
    declare date : string

    @Column({
        type : DataType.STRING,
        defaultValue : STATUS.PENDING
    })
    declare orderStatus : string

    @Column({
        type : DataType.STRING(30),
        defaultValue: PAYMENT_METHOD.CASH
    })
    declare paymentMethod : string

    @Column({
        type : DataType.STRING(10),
        allowNull : false
    })
    declare amount : string

    @Column({
        type : DataType.STRING(100),
        allowNull : true
    })
    declare transactionId : string
}


export default OrderModels