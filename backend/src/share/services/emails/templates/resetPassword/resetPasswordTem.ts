import fs from 'fs'
import ejs from 'ejs'
import { IResetPasswordParams } from '@user/userInterfaces/user.interface'

class ResetPasswordTemplate {
    public passwordResetConfirmTemplate(templateParams: IResetPasswordParams): string {
        const { username, email, ipaddress, date } = templateParams
        return ejs.render(fs.readFileSync(__dirname + '\\resetPasswordTem.ejs', 'utf-8'), {
            username,
            email,
            ipaddress,
            date,
            image_url: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Flock&psig=AOvVaw3ZELlPsZkH3GVCT1zKu_3-&ust=1673613835575000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCNCZh8KHwvwCFQAAAAAdAAAAABAE'
        })
    }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate()