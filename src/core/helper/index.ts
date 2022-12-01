export function stringEvery(s: string, ch: string) {
    for(let i = 0; i < s.length; i++) {
        if(s[i] !== ch) return false
    }
    return true
}