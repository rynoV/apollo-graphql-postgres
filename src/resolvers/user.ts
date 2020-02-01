import jwt from 'jsonwebtoken'

import { IModels } from '../models'
import { UserModel } from '../models/user'
import { UserInputError, AuthenticationError } from 'apollo-server-express'
import { combineResolvers } from 'graphql-resolvers'
import { isAdmin } from './authentication'
import DataLoader from 'dataloader'

function createToken(user: UserModel, secret: string, expiresIn: string) {
    const { username, id, email, role } = user
    return jwt.sign({ username, email, id, role }, secret, { expiresIn })
}

export interface IContext {
    models: IModels
    me: UserModel
    secret: string
    loaders: {
        user: DataLoader<string, UserModel | undefined>
    }
}

interface IUser {
    username: string
    email: string
    password: string
}

export const userResolvers = {
    Query: {
        async me(_: any, __: any, { models, me }: IContext) {
            if (!me) {
                return null
            }

            return await models.User.findByPk(me.id)
        },
        async user(_: any, { id }: { id: string }, { models }: IContext) {
            return await models.User.findByPk(id)
        },
        async users(_: any, __: any, { models }: IContext) {
            return await models.User.findAll()
        },
    },
    Mutation: {
        async signUp(
            _: any,
            { username, email, password }: IUser,
            { models, secret }: IContext
        ) {
            const user = await models.User.create({ username, email, password })
            return { token: createToken(user, secret, '30m') }
        },
        async signIn(
            _: any,
            { login, password }: { login: string; password: string },
            { models, secret }: IContext
        ) {
            const user = await models.User.findByLogin(login)

            if (!user) {
                throw new UserInputError(
                    'No user found with these credentials.'
                )
            }

            const isValid = await user.validatePassword(password)

            if (!isValid) {
                throw new AuthenticationError('Invalid password.')
            }

            return { token: createToken(user, secret, '30m') }
        },
        deleteUser: combineResolvers(isAdmin, async function(
            _: any,
            { id }: { id: string },
            { models }: IContext
        ) {
            return await models.User.destroy({ where: { id } })
        }),
    },
    User: {
        async messages(user: { id: string }, _: any, { models }: IContext) {
            return await models.Message.findAll({ where: { userId: user.id } })
        },
    },
}
