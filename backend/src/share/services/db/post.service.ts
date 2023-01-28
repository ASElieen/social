import { IPostDocument } from '@post/interfaces/post.interface'
import { PostModel } from '@root/features/post/models/post.schema'
import { UpdateQuery } from 'mongoose'
import { IUserDocument } from '@user/userInterfaces/user.interface'
import { UserModel } from '@root/features/user/userModel/user.schema'


class PostService {
    public async addPostToDB(userId: string, createPost: IPostDocument): Promise<void> {
        //直接用IPost或者IUser类型的话在后面加await
        const post: Promise<IPostDocument> = PostModel.create(createPost)
        //$inc自增
        const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } })
        await Promise.all([post, user])
    }
}

export const postService: PostService = new PostService()