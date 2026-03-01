export const truncateText = (text?: string) => {
    if (!text)
        return text;
    if (text.length < 25)
        return text;
    else
        return text.slice(0, 22) + '...'
}