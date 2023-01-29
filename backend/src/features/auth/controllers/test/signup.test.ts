import { Request, Response } from 'express'
import { authMockRequest, authMockResponse } from '../../../../mocks/auth.mock'
import { SignUp } from '../signUp'
import { CustomError } from '@global/helpers/errorHandler'


jest.mock('@services/queues/base.queue')
jest.mock('@services/queues/user.queue')
jest.mock('@services/queues/auth.queue')
jest.mock('@services/redis/user.cache')
jest.mock('@global/helpers/cloudinaryUpload')

describe('signUp', () => {
    it('should throw an Error if username has already existed', () => {
        const req: Request = authMockRequest({}, {
            username: '',
            email: 'manny@test.com',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ'
        }) as Request
        const res: Response = authMockResponse()

        SignUp.prototype.create(req, res).catch((error: CustomError): void => {
            expect(error.statusCode).toEqual(400)
            // expect(error.serializeErrors().message).toEqual('')
        })
    })

    it('should throw an Error if username length is less than minimum', () => {
        const req: Request = authMockRequest({}, {
            username: 'mm',
            email: 'manny@test.com',
            password: 'qwerty',
            avatarColor: 'red',
            avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ'
        }) as Request
        const res: Response = authMockResponse()

        SignUp.prototype.create(req, res).catch((error: CustomError): void => {
            expect(error.statusCode).toEqual(400)
            // expect(error.serializeErrors().message).toEqual('')
        })
    })
})