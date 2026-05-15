export function autoGrow(event: Event) {
    const element = event.target as HTMLTextAreaElement
    if (!element) return
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
}
