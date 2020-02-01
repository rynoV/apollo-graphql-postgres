// This should be imported before any other JS that needs access to env vars
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import http from 'http'
import DataLoader from 'dataloader'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import { schema } from './schemas'
import { models, sequelize } from './models'
import { resolvers } from './resolvers'
import { Roles, UserModel } from './models/user'
import { loaders } from './loaders'

const app = express()

app.use(cors())

/**
 * If an x-token is provided, verifies that it is valid and returns the user corresponding to the token. Errors if it is invalid. Returns null if no token was provided.
 * @param  {express.Request} req
 */
function getMe(req: express.Request) {
    const token = req.headers['x-token'] as string | undefined

    if (token) {
        try {
            return jwt.verify(token, process.env.SECRET as string)
        } catch (e) {
            throw new AuthenticationError(
                'Your session expired. Sign in again.'
            )
        }
    } else {
        // throw new ApolloError('No token provided.')
        console.warn('No token provided')
        return null
    }
}

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: ({ req, connection }) => {
        if (connection) {
            return {
                models,
                loaders: {
                    user: new DataLoader<string, UserModel | undefined>(keys =>
                        loaders.user.batchUsers(keys as string[], models)
                    ),
                },
            }
        }

        if (req) {
            const me = getMe(req)
            return {
                models,
                me,
                secret: process.env.SECRET,
                loaders: {
                    user: new DataLoader<string, UserModel | undefined>(keys =>
                        loaders.user.batchUsers(keys as string[], models)
                    ),
                },
            }
        }

        return
    },
})

server.applyMiddleware({ app, path: '/graphql' })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

const isTest = !!process.env.TEST_DATABASE
// Use server's port if it's available
const port = process.env.PORT || 8000

sequelize.sync({ force: isTest }).then(async () => {
    if (isTest) {
        createUsersWithMessages(new Date())
    }

    httpServer.listen({ port }, () => {
        console.log(`Apollo Server on http://localhost:${port}/graphql`)
    })
})

async function createUsersWithMessages(date: Date) {
    await models.User.create(
        {
            username: 'rynoV',
            email: 'sieppertcalum@gmail.com',
            password: 'rynoVpw',
            role: Roles.ADMIN,
            messages: [
                {
                    text: 'Hello Message',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        { include: [models.Message] }
    )
    await models.User.create(
        {
            username: 'geoman',
            email: 'geoman@ucalgary.ca',
            password: 'geomanpw',
            messages: [
                {
                    text: 'Hello geoman',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
                {
                    text: 'Hows it goin?',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        { include: [models.Message] }
    )
}
