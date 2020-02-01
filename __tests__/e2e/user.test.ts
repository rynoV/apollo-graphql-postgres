import * as api from '../api'

describe('users', () => {
    describe('user(id: String!): User', () => {
        test('returns a user when a user can be found', async () => {
            const expectedResult = {
                data: {
                    user: {
                        id: '1',
                        username: 'rynoV',
                        email: 'sieppertcalum@gmail.com',
                        role: 'ADMIN',
                    },
                },
            }

            const result = await api.user({ id: '1' })

            expect(result.data).toEqual(expectedResult)
        })

        test('returns null when a user cannot be found', async () => {
            const expectedResult = {
                data: {
                    user: null,
                },
            }

            const result = await api.user({ id: '42' })

            expect(result.data).toEqual(expectedResult)
        })
    })
    describe('deleteUser(id: String!): Boolean!', () => {
        test('returns an error because only admin users can delete users', async () => {
            const {
                data: {
                    data: {
                        signIn: { token },
                    },
                },
            } = await api.signIn({ login: 'geoman', password: 'geomanpw' })

            const {
                data: { errors },
            } = await api.deleteUser({ id: '1' }, token)

            expect(errors[0].message).toEqual('Not authenticated as admin.')
        })
    })
})
