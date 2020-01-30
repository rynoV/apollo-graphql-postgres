// This should be imported before any other JS that needs access to env vars
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { schema } from './schemas'
import { models, sequelize } from './models'
import { resolvers } from './resolvers'

const app = express()

app.use(cors())

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: async () => {
        return {
            models,
            me: await models.User.findByLogin('rynoV'),
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
