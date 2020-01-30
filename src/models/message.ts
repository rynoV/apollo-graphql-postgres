import { Model, BuildOptions, Sequelize, DataTypes } from 'sequelize/types'

import { IModels } from '.'

// We need to declare an interface for our model that is basically what our class would be
interface MessageModel extends Model {
    readonly text: string
}

// Need to declare the static model so `findOne` etc. use correct types.
export type MessageModelStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): MessageModel
    associate(models: IModels): void
}

export default function message(
    sequelize: Sequelize,
    dataTypes: typeof DataTypes
) {
    const Message = <MessageModelStatic>sequelize.define('message', {
        text: {
            type: dataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: 'A message must have text.',
                },
            },
        },
    })

    Message.associate = models => {
        Message.belongsTo(models.User)
    }

    return Message
}
