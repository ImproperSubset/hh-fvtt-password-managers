/**
 * Marks fields so 1Password leaves them alone.
 * https://www.1password.dev/web/compatible-website-design/
 */

export const IGNORE_ATTRIBUTE = 'data-1p-ignore'

// Password fields stay unmarked so 1Password can still fill a real secret.
const FIELD_SELECTOR = 'input:not([type="password"]):not([type="hidden"]), textarea'

/**
 * Adds the ignore attribute to every matching field in root, root included.
 * @param {Element|Document} root
 * @returns {number} how many fields were newly marked
 */
export function markFields (root) {
  const fields = Array.from(root.querySelectorAll?.(FIELD_SELECTOR) ?? [])
  if (root.matches?.(FIELD_SELECTOR)) fields.push(root)
  let marked = 0
  for (const field of fields) {
    if (field.hasAttribute(IGNORE_ATTRIBUTE)) continue
    field.setAttribute(IGNORE_ATTRIBUTE, '')
    marked++
  }
  return marked
}

/**
 * Marks the fields already in root and every field added to it later,
 * including inputs whose type changes to or from password.
 * @param {Element} root
 * @returns {MutationObserver}
 */
export function watchFields (root) {
  markFields(root)
  const observer = new root.ownerDocument.defaultView.MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        const field = record.target
        if (field.getAttribute('type') === 'password') field.removeAttribute(IGNORE_ATTRIBUTE)
        else markFields(field)
        continue
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === 1) markFields(node)
      }
    }
  })
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['type'] })
  return observer
}
