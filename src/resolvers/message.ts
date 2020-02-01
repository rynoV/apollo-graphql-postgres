import { IContext } from './user'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner } from './authentication'
import { pubsub, EVENTS } from '../subscription'
import Sequelize from 'sequelize'

function toCursorHash(cursor: string) {
    return Buffer.from(cursor).toString('base64')
}

function fromCursorHash(cursorHash: string) {
    return Buffer.from(cursorHash, 'base64').toString('ascii')
}

export const messageResolvers = {
    Query: {
        async messages(
            _: any,
            { limit = 100, cursor }: { limit: number; cursor: string },
            { models }: IContext
        ) {
            // Find all items with dates before the cursor using Sequelize less than operator
            const cursorOptions = cursor
                ? { createdAt: { [Sequelize.Op.lt]: fromCursorHash(cursor) } }
                : undefined

            const messages = await models.Message.findAll({
                order: [['createdAt', 'DESC']],
                limit: limit + 1,
                where: cursorOptions,
            })

            const hasNextPage = messages.length > limit
            const edges = hasNextPage ? messages.slice(0, -1) : messages

            return {
                edges,
                pageInfo: {
                    hasNextPage,
                    endCursor: toCursorHash(
                        edges[edges.length - 1].createdAt.toString()
                    ),
                },
            }
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
            const message = await models.Message.create({ text, userId: me.id })

            pubsub.publish(EVENTS.MESSAGE.CREATED, {
                messageCreated: { message },
            })

            return message
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
    Subscription: {
        messageCreated: {
            subscribe() {
                return pubsub.asyncIterator(EVENTS.MESSAGE.CREATED)
            },
        },
    },
}
