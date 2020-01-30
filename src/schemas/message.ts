import { gql } from 'apollo-server-express'

export const messageSchema = gql`
    extend type Query {
        messages: [Message!]!
        message(id: ID!): Message!
    }
    extend type Mutation {
        createMessage(text: String!): Message!
        deleteMessage(id: ID!): Boolean!
        updateMessage(id: ID!, text: String!): Boolean!
    }
    type Message {
        id: ID!
        text: String!
        user: User!
    }
`
