import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

export const uploads = (file: string, publicID?: string, overwrite?: boolean, invalidate?: boolean): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> => {
    return new Promise((reslove) => {
        cloudinary.v2.uploader.upload(file, {
            public_id: publicID,
            overwrite,
            invalidate
        },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) reslove(error)
                reslove(result)
            })
    })
}