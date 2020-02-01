import { IModels } from '../models'
import { UserModel } from '../models/user'
import * as Sequelize from 'sequelize'

type BatchReturn = Promise<Array<UserModel | undefined | Error>>

/**
 * Recieves a list of deduplicated keys from the DataLoader class and returns the users in the order of the keys
 */
export async function batchUsers(keys: string[], models: IModels): BatchReturn {
    // Find all users with an id matching one of the keys
    const users = await models.User.findAll({
        where: { id: { [Sequelize.Op.in]: keys } },
    })
    // Ensure that the users are in the same order as the keys
    return keys.map(key => users.find(user => user.id === key))
}
