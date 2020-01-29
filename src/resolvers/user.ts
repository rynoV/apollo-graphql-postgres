import { IMessages } from '../models'

export interface IContext {
    models: {
        users: {}
        messages: IMessages
    }
    me: any
}

export const userResolvers = {
    Query: {
        me(_: any, __: any, context: IContext) {
            return context.me
        },
        user(_: any, { id }: { id: number }, { models }: IContext) {
            return models.users[id]
        },
        users(_: any, __: any, { models }: IContext) {
            return Object.values(models.users)
        },
    },
    User: {
        messages(user: { id: string }, _: any, { models }: IContext) {
            return Object.values(models.messages).filter(
                message => message.userId === user.id
            )
        },
    },
}
