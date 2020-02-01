import { Sequelize } from 'sequelize'
import { UserModelStatic } from './user'
import { MessageModelStatic } from './message'

export let sequelize: Sequelize
// DATABASE_URL will be defined on the prod server
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL as string, {
        dialect: 'postgres',
    })
} else {
    sequelize = new Sequelize(
        (process.env.TEST_DATABASE as string) ||
            (process.env.DATABASE as string),
        process.env.DATABASE_USER as string,
        process.env.DATABASE_PASSWORD as string,
        { dialect: 'postgres' }
    )
}

export interface IModels {
    User: UserModelStatic
    Message: MessageModelStatic
}

export const models: IModels = {
    User: sequelize.import('./user'),
    Message: sequelize.import('./message'),
}

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models)
    }
})
