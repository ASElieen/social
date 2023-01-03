/* eslint-disable @typescript-eslint/no-explicit-any */
import { JoiRequestValidationError } from '@global/helpers/errorHandler'
import { Request } from 'express'
import { ObjectSchema } from 'joi'

type IJorDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void

export const joiValidation = (schema: ObjectSchema): IJorDecorator => {
    return (_target: any, _key: string, descriptor: PropertyDescriptor) => {

        const originMethod = descriptor.value

        descriptor.value = async (...args: any[]) => {
            //参数顺序(req,res,next)
            const req: Request = args[0]
            const { error } = await Promise.resolve(schema.validate(req.body))
            if (error?.details) {
                throw new JoiRequestValidationError(error.details[0].message)
            }

            return originMethod.apply(this, args)
        }
        return descriptor
    }
}