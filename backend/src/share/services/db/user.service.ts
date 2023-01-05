import { IUserDocument } from '@user/userInterfaces/user.interface'
import { UserModel } from '@root/features/user/userModel/user.schema'

class UserService {
    public async addUserData(data: IUserDocument): Promise<void> {
        await UserModel.create(data)
    }
}

export const userService: UserService = new UserService()