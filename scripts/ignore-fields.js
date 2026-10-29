/**
 * Marks fields so password managers leave them alone.
 */

/** Each password manager's ignore attribute and the value it expects. */
export const IGNORE_ATTRIBUTES = {
  // https://www.1password.dev/web/compatible-website-design/
  'data-1p-ignore': '',
  // Honored only when the user enables "Allow websites to exclude fields to autofill".
  'data-bwignore': '',
  // https://support.dashlane.com/hc/articles/4420122792594
  'data-form-type': 'other',
  // https://support.lastpass.com/s/document-item?language=en_US&bundleId=lastpass&topicId=LastPass/c_lp_prevent_fields_from_being_filled_automatically.html&_LANG=enus
  'data-lpignore': 'true',
  // Read by attrIgnored in @protontech/autofill.
  'data-protonpass-ignore': ''
}

// Password fields stay unmarked so a password manager can still fill a real secret.
const FIELD_SELECTOR = 'input:not([type="password"]):not([type="hidden"]), textarea'

/**
 * Adds the ignore attributes to every matching field in root, root included.
 * @param {Element|Document} root
 * @returns {number} how many fields were newly marked
 */
export function markFields (root) {
  const fields = Array.from(root.querySelectorAll?.(FIELD_SELECTOR) ?? [])
  if (root.matches?.(FIELD_SELECTOR)) fields.push(root)
  let marked = 0
  for (const field of fields) {
    let changed = false
    for (const [name, value] of Object.entries(IGNORE_ATTRIBUTES)) {
      if (field.hasAttribute(name)) continue
      field.setAttribute(name, value)
      changed = true
    }
    if (changed) marked++
  }
  return marked
}

/**
 * Removes the ignore attributes from a field, keeping any the page set to another value.
 * @param {Element} field
 */
function unmarkField (field) {
  for (const [name, value] of Object.entries(IGNORE_ATTRIBUTES)) {
    if (field.getAttribute(name) === value) field.removeAttribute(name)
  }
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
        if (field.getAttribute('type') === 'password') unmarkField(field)
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
