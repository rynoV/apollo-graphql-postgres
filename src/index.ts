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

// Avoid cross origin errors
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
        return null
    }
}

const server = new ApolloServer({
    // Define the data types in our application
    typeDefs: schema,
    // Define how the data corresponding to each type should be retrieved
    resolvers,
    // Pass values to our resolvers through context
    context: ({ req, connection }) => {
        // The connection object comes when the request is a subscription
        if (connection) {
            return {
                models,
            }
        }

        // The req object comes when the request is HTTP (Graphql queries and mutations)
        if (req) {
            // Retrieve the current user
            const me = getMe(req)
            return {
                // Give the resolvers access to our data storage mechanism
                models,
                me,
                // So the resolvers can create/verify JWTs
                secret: process.env.SECRET,
                // Allow the resolvers to add their data to the batch
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

// Tell Apollo to use express and to use /graphql as the postfix for the url
server.applyMiddleware({ app, path: '/graphql' })

// Use the http package's server so that we can deal with subscriptions
const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

const isTest = !!process.env.TEST_DATABASE
// Use server's port if it's available
const port = process.env.PORT || 8000

// Ensure the database is ready before we start the app, drop existing tables when we are testing
sequelize.sync({ force: isTest }).then(async () => {
    // Seed the database for testing
    if (isTest) {
        createUsersWithMessages(new Date())
    }

    httpServer.listen({ port }, () => {
        console.log(`Apollo Server on http://localhost:${port}/graphql`)
    })
})

/**
 * Seed the database with one admin and one non-admin user, each with messages created one second apart
 * @param date
 */
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
