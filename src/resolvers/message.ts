import { IContext } from './user'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner } from './authentication'

export const messageResolvers = {
    Query: {
        async messages(_: any, __: any, { models }: IContext) {
            return await models.Message.findAll()
        },
        async message(_: any, { id }: { id: string }, { models }: IContext) {
            return await models.Message.findByPk(id)
        },
    },
    Mutation: {
        createMessage: combineResolvers(isAuthenticated, async function(
            _: any,
            { text }: { text: string },
            { me, models }: IContext
        ) {
            return await models.Message.create({ text, userId: me.id })
        }),
        deleteMessage: combineResolvers(
            isAuthenticated,
            isMessageOwner,
            async function(
                _: any,
                { id }: { id: string },
                { models }: IContext
            ) {
                return await models.Message.destroy({ where: { id } })
            }
        ),
        async updateMessage(
            _: any,
            { id, text }: { id: string; text: string },
            { models }: IContext
        ) {
            return !!(await models.Message.update({ text }, { where: { id } }))
        },
    },
    Message: {
        async user(
            { userId }: { userId: string },
            _: any,
            { models }: IContext
        ) {
            return models.User.findByPk(userId)
        },
    },
}
