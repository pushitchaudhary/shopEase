import {Table, Model, Column, DataType, AllowNull} from 'sequelize-typescript'

@Table({
    tableName : 'products',
    modelName : 'ProductModel',
    timestamps : true
})

class ProductModel extends Model {
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4,
        allowNull : false
    })
    declare id : string

    @Column({
        type : DataType.STRING(200),
        allowNull : false
    })
    declare name : string

    @Column({
        type : DataType.TEXT,
        allowNull : true
    })
    declare description : string

    @Column({
        type : DataType.STRING(10),
        allowNull : false
    })
    declare price : string

    @Column({
        type : DataType.INTEGER,
        allowNull : false,
        defaultValue : 0
    })
    declare stockQuantity : string

    @Column({
        type : DataType.TEXT,
        allowNull : false
    })
    declare productImageUrl : string

    @Column({
        type : DataType.STRING,
        allowNull : true
    })
    declare weight : string

    @Column({
        type : DataType.BOOLEAN,
        defaultValue : true
    })
    declare status : string
}
export default ProductModel