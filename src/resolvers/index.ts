import { GraphQLDateTime } from 'graphql-iso-date'

import { userResolvers } from './user'
import { messageResolvers } from './message'

const customScalarResolver = {
    Date: GraphQLDateTime,
}

export const resolvers = [customScalarResolver, userResolvers, messageResolvers]
