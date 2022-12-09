export function stringEvery(s: string, ch: string) {
    for(let i = 0; i < s.length; i++) {
        if(s[i] !== ch) return false
    }
    return true
}

import fs, { constants } from 'fs/promises'

export async function getFile(path: string) {
    try {
        await fs.access(path, constants.R_OK)
        return await fs.readFile(path)
    } catch (err) {
        return null
    }

}