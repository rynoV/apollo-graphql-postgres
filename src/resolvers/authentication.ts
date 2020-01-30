import { skip, combineResolvers } from 'graphql-resolvers'
import { IContext } from './user'
import { ForbiddenError, ApolloError } from 'apollo-server-express'

export function isAuthenticated(_: any, __: any, { me }: IContext) {
    return me ? skip : new ForbiddenError('Not authenticated as user.')
}

export const isAdmin = combineResolvers(isAuthenticated, function(
    _: any,
    __: any,
    { me }: IContext
) {
    return me.role === 'ADMIN'
        ? skip
        : new ForbiddenError('Not authenticated as admin.')
})

export async function isMessageOwner(
    _: any,
    { id }: { id: string },
    { me, models }: IContext
) {
    const message = await models.Message.findByPk(id, { raw: true })

    if (!message) {
        throw new ApolloError('Message not found.')
    }

    if (message.userId !== me.id) {
        throw new ForbiddenError('Not authenticated as owner of message.')
    }

    return skip
}
