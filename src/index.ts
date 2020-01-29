// This should be imported before any other JS that needs access to env vars
// import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { schema } from './schemas'
import models from './models'
import { resolvers } from './resolvers'

const app = express()

app.use(cors())

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
        models,
        me: models.users[1],
    },
})

server.applyMiddleware({ app, path: '/graphql' })

app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql')
})
