import uuidv4 from 'uuid/v4'
import { IMessages } from './models'

interface IContext {
    models: {
        users: {}
        messages: IMessages
    }
    me: any
}

export const resolvers = {
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
        messages(_: any, __: any, { models }: IContext) {
            return Object.values(models.messages)
        },
        message(_: any, { id }: { id: number }, { models }: IContext) {
            return models.messages[id]
        },
    },
    Mutation: {
        createMessage(
            _: any,
            { text }: { text: string },
            { me, models }: IContext
        ) {
            const id = uuidv4()
            const message = { text, userId: me.id, id: id }
            models.messages[id] = message
            models.users[me.id].messageIds.push(id)
            return message
        },
        deleteMessage(_: any, { id }: { id: number }, { models }: IContext) {
            const { [id]: message, ...otherMessages } = models.messages
            if (!message) {
                return false
            }
            models.messages = otherMessages
            return true
        },
        updateMessage(
            _: any,
            { id, text }: { id: number; text: string },
            { models }: IContext
        ) {
            if (!(id in models.messages)) {
                return null
            }
            models.messages[id].text = text
            return models.messages[id]
        },
    },
    Message: {
        user(message: { userId: number }, _: any, { models }: IContext) {
            return models.users[message.userId]
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
