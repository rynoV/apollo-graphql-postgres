// This should be imported before any other JS that needs access to env vars
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import { schema } from './schemas'
import { models, sequelize } from './models'
import { resolvers } from './resolvers'
import { Roles } from './models/user'

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
    context: ({ req }) => {
        const me = getMe(req)
        return {
            models,
            me,
            secret: process.env.SECRET,
        }
    },
})

server.applyMiddleware({ app, path: '/graphql' })

const eraseDatabaseOnSync = true

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
        createUsersWithMessages()
    }

    app.listen({ port: 8000 }, () => {
        console.log('Apollo Server on http://localhost:8000/graphql')
    })
})

async function createUsersWithMessages() {
    await models.User.create(
        {
            username: 'rynoV',
            email: 'sieppertcalum@gmail.com',
            password: 'rynoVpw',
            role: Roles.ADMIN,
            messages: [{ text: 'Hello Message' }],
        },
        { include: [models.Message] }
    )
    await models.User.create(
        {
            username: 'geoman',
            email: 'geoman@ucalgary.ca',
            password: 'geomanpw',
            messages: [{ text: 'Hello geoman' }, { text: 'Hows it goin?' }],
        },
        { include: [models.Message] }
    )
}
