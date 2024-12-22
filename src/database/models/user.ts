import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  modelName: 'UserModel',
  timestamps: true, 
})
class UserModel extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true, 
  })
  declare email: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING(15), 
    allowNull: false,
  })
  declare phoneNumber: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare profilePictureUrl: string;

  @Column({
    type: DataType.DATEONLY, 
    allowNull: false,
  })
  declare dateOfBirth: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  declare gender: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare address: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare role: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: true, 
  })
  declare otp: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare status: boolean; 
}

export default UserModel;
