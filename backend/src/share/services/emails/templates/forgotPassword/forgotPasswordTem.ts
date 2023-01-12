import fs from 'fs'
import ejs from 'ejs'

class ForgotPasswordTemplate {
    public passwordResetTemplate(username: string, resetLink: string): string {
        return ejs.render(fs.readFileSync(__dirname + '\\forgotPasswordTem.ejs', 'utf-8'), {
            username,
            resetLink,
            image_url: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Flock&psig=AOvVaw3ZELlPsZkH3GVCT1zKu_3-&ust=1673613835575000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCNCZh8KHwvwCFQAAAAAdAAAAABAE'
        })
    }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate()