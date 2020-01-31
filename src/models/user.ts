import { Model, BuildOptions, Sequelize, DataTypes } from 'sequelize'
import { IModels } from '.'
import bcrypt from 'bcrypt'

export const enum Roles {
    ADMIN = 'ADMIN',
}

// We need to declare an interface for our model that is basically what our class would be
export interface UserModel extends Model {
    generatePasswordHash(): Promise<string>
    validatePassword(password: string): Promise<boolean>
    readonly username: string
    readonly email: string
    readonly id: string
    readonly role: Roles
    password: string
}

// Need to declare the static model so `findOne` etc. use correct types.
export type UserModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): UserModel
    associate(models: IModels): void
    findByLogin(login: string): Promise<UserModel | null>
}

export default function user(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
) {
    // TS can't derive a proper class definition from a `.define` call, therefor we need to cast here.
    const User = <UserModelStatic>sequelize.define('user', {
        username: {
            type: dataTypes.STRING,
            // unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        email: {
            type: dataTypes.STRING,
            // unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
                isEmail: true,
            },
        },
        password: {
            type: dataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [7, 42],
            },
        },
        role: {
            type: dataTypes.STRING,
        },
    })

    User.associate = models => {
        User.hasMany(models.Message, { onDelete: 'CASCADE' })
    }

    User.findByLogin = async login => {
        let user = await User.findOne({ where: { username: login } })

        if (!user) {
            user = await User.findOne({ where: { email: login } })
        }

        return user
    }

    User.beforeCreate(async user => {
        user.password = await user.generatePasswordHash()
    })

    User.prototype.generatePasswordHash = async function() {
        const saltRounds = 10
        return await bcrypt.hash(this.password, saltRounds)
    }

    User.prototype.validatePassword = async function(password: string) {
        return await bcrypt.compare(password, this.password)
    }

    return User
}
