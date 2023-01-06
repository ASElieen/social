import { IUserDocument } from '@user/userInterfaces/user.interface'
import { UserModel } from '@root/features/user/userModel/user.schema'
import mongoose from 'mongoose'

class UserService {
    public async addUserData(data: IUserDocument): Promise<void> {
        await UserModel.create(data)
    }

    public async getUserByAuthId(authId: string): Promise<IUserDocument> {
        const users: IUserDocument[] = await UserModel.aggregate([
            { $match: { authId: new mongoose.Types.ObjectId(authId) } },
            { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            { $project: this.aggregateProject() }
        ])
        return users[0]
    }

    private aggregateProject() {
        return {
            //todo 返回具体数据
        }
    }
}

export const userService: UserService = new UserService()