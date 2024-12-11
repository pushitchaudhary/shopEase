import {Table, Column, Model, DataType, DefaultScope} from 'sequelize-typescript'

@Table({
    tableName : 'orderItems',
    modelName : 'OrderItemModel',
    timestamps : true
})

class OrderItemModel extends Model{
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4,
        allowNull : false
    })
    declare id : string

    @Column({
        type : DataType.INTEGER,
        allowNull : false
    })
    declare price : string

    @Column({
        type : DataType.INTEGER,
        defaultValue : 1,
        allowNull : false
    })
    declare quantity : string
}

export default OrderItemModel