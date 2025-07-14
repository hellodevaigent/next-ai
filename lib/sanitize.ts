import sanitizeHtml from 'sanitize-html'

export function sanitizeUserInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
}