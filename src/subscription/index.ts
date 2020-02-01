import { PubSub } from 'apollo-server'
import { MESSAGE_EVENTS } from './message'

export const EVENTS = {
    MESSAGE: MESSAGE_EVENTS,
}

export const pubsub = new PubSub()
