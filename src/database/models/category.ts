import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName : 'category',
    modelName : 'CategoryModel',
    timestamps : true
})

class CategoryModel extends Model{
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull:false,
    })
    declare id : string;

    @Column({
        type : DataType.STRING(200),
        allowNull : false
    })
    declare name : string

    @Column({
        type : DataType.BOOLEAN,
        defaultValue : true,
        allowNull : false
    })
    declare status : string    
}

export default CategoryModel