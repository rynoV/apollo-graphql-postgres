import { IContext } from './user'

export const messageResolvers = {
    Query: {
        async messages(_: any, __: any, { models }: IContext) {
            return await models.Message.findAll()
        },
        async message(_: any, { id }: { id: number }, { models }: IContext) {
            return await models.Message.findByPk(id)
        },
    },
    Mutation: {
        async createMessage(
            _: any,
            { text }: { text: string },
            { me, models }: IContext
        ) {
            return await models.Message.create({ text, userId: me.id })
        },
        async deleteMessage(
            _: any,
            { id }: { id: number },
            { models }: IContext
        ) {
            return await models.Message.destroy({ where: { id } })
        },
        async updateMessage(
            _: any,
            { id, text }: { id: number; text: string },
            { models }: IContext
        ) {
            return !!(await models.Message.update({ text }, { where: { id } }))
        },
    },
    Message: {
        async user(
            { userId }: { userId: number },
            _: any,
            { models }: IContext
        ) {
            return models.User.findByPk(userId)
        },
    },
}
