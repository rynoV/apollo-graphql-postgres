import axios from 'axios'

const API_URL = 'http://localhost:8000/graphql'

export async function user(variables: any) {
    return axios.post(API_URL, {
        query: `
            query($id: ID!) {
                user(id: $id) {
                    id
                    username
                    email
                    role
                }
            }
        `,
        variables,
    })
}

export async function signIn(variables: any) {
    return axios.post(API_URL, {
        query: `
            mutation($login: String!, $password: String!) {
                signIn(login: $login, password: $password) {
                    token
                }
            }
        `,
        variables,
    })
}

export async function deleteUser(variables: any, token: string) {
    return axios.post(
        API_URL,
        {
            query: `
                mutation ($id: ID!) {
          deleteUser(id: $id)
        }
        `,
            variables,
        },
        { headers: { 'x-token': token } }
    )
}
