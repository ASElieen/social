
export class Helpers {
    static firstLetterUppercase(str: string): string {
        const valueStr = str.toLowerCase()
        return valueStr[0].toUpperCase() + valueStr.slice(1)
    }

    static lowerCase(str: string): string {
        return str.toLowerCase()
    }

    static generateRandomIntegers(integerLength: number): number {
        const characters = '0123456789'
        let result = ''
        const charactersLength = characters.length
        for (let i = 0; i < integerLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return parseInt(result, 10)
    }

    static parseJSON(prop: string): any {
        try {
            JSON.parse(prop)
        } catch (error) {
            return prop
        }
        return JSON.parse(prop)
    }
}