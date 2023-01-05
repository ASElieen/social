import { IAuthDocument } from '../../../features/auth/interfaces/auth.interface'
import { Helpers } from '../../globals/helpers/helpers'
import { AuthModel } from '@root/features/auth/models/auth.schema'


class AuthService {
    public async createAuthUser(data: IAuthDocument): Promise<void> {
        await AuthModel.create(data)
    }

    public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
        //$or在数组表达式的条件下选择至少满足一个条件的文档
        const query = {
            $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
        }

        const user: IAuthDocument = await AuthModel.findOne(query).exec() as IAuthDocument
        return user
    }

    public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
        const user: IAuthDocument = await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec() as IAuthDocument
        return user
    }
}

export const authService: AuthService = new AuthService()