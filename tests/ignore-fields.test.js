import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { IGNORE_ATTRIBUTES, markFields, watchFields } from '../scripts/ignore-fields.js'

const settle = window => new Promise(resolve => window.setTimeout(resolve, 0))

const isMarked = field => Object.entries(IGNORE_ATTRIBUTES).every(([name, value]) => field.getAttribute(name) === value)
const isUnmarked = field => Object.keys(IGNORE_ATTRIBUTES).every(name => !field.hasAttribute(name))

// Foundry's Create Actor / Create Item dialog body.
const CREATE_DIALOG = `
  <form>
    <div class="form-group"><label>Name</label>
      <div class="form-fields"><input type="text" name="name" placeholder="New Actor"></div></div>
    <div class="form-group"><label>Type</label>
      <div class="form-fields"><select name="type"><option value="character">Character</option></select></div></div>
  </form>`

test('sets every password manager attribute to the value it expects', () => {
  assert.deepEqual(IGNORE_ATTRIBUTES, {
    'data-1p-ignore': '',
    'data-bwignore': '',
    'data-form-type': 'other',
    'data-lpignore': 'true',
    'data-protonpass-ignore': ''
  })
})

test('marks text inputs and textareas already on the page', () => {
  const { document } = new JSDOM(`<body><input name="name"><input type="number"><textarea></textarea></body>`).window
  assert.equal(markFields(document.body), 3)
  for (const field of document.querySelectorAll('input, textarea')) assert.ok(isMarked(field))
})

test('leaves password and hidden inputs and selects unmarked', () => {
  const { document } = new JSDOM(`<body><input type="password"><input type="hidden"><select></select></body>`).window
  assert.equal(markFields(document.body), 0)
  for (const field of document.querySelectorAll('input, select')) assert.ok(isUnmarked(field))
})

test('keeps an attribute the page already set', () => {
  const { document } = new JSDOM(`<body><input data-form-type="username"></body>`).window
  assert.equal(markFields(document.body), 1)
  const input = document.querySelector('input')
  assert.equal(input.getAttribute('data-form-type'), 'username')
  assert.ok(input.hasAttribute('data-1p-ignore'))
})

test('marks the name field of a dialog rendered after start-up', async () => {
  const { window } = new JSDOM('<body></body>')
  const observer = watchFields(window.document.body)
  const dialog = window.document.createElement('dialog')
  dialog.innerHTML = CREATE_DIALOG
  window.document.body.append(dialog)
  await settle(window)
  assert.ok(isMarked(window.document.querySelector('input[name="name"]')))
  assert.ok(isUnmarked(window.document.querySelector('select')))
  observer.disconnect()
})

test('marks a field inserted on its own', async () => {
  const { window } = new JSDOM('<body><div id="app"></div></body>')
  const observer = watchFields(window.document.body)
  const input = window.document.createElement('input')
  window.document.getElementById('app').append(input)
  await settle(window)
  assert.ok(isMarked(input))
  observer.disconnect()
})

test('follows an input whose type changes to and from password', async () => {
  const { window } = new JSDOM('<body><input id="secret" type="text"></body>')
  const observer = watchFields(window.document.body)
  const input = window.document.getElementById('secret')
  assert.ok(isMarked(input))
  input.type = 'password'
  await settle(window)
  assert.ok(isUnmarked(input))
  input.type = 'text'
  await settle(window)
  assert.ok(isMarked(input))
  observer.disconnect()
})
