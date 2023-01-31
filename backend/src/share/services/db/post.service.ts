import { IPostDocument, IGetPostsQuery } from '@post/interfaces/post.interface'
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

    public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
        let postQuery = {}
        if (query?.imgId && query?.gifUrl) {
            //not equal
            postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] }
        } else {
            postQuery = query
        }
        /* 
        sort -1降序1升序
        limit 限制查询条数
        skip 跳过前n个文档
        */
        const posts: IPostDocument[] = await PostModel.aggregate([
            { $match: postQuery },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
        ])
        return posts
    }

    public async postsCount(): Promise<number> {
        //countDocuments返回选择条件匹配的文档数
        const counts: number = await PostModel.find({}).countDocuments()
        return counts
    }

    public async deletePost(postId: string, userId: string): Promise<void> {
        const deletePost = PostModel.deleteOne({ _id: postId })
        const decrementPostsCount = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } })
        await Promise.all([deletePost, decrementPostsCount])
    }

    public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
        //$set 更新操作符
        const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost })
        await Promise.all([updatePost])
    }
}

export const postService: PostService = new PostService()