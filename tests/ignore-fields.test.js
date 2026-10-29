import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { IGNORE_ATTRIBUTE, markFields, watchFields } from '../scripts/ignore-fields.js'

const settle = window => new Promise(resolve => window.setTimeout(resolve, 0))

// Foundry's Create Actor / Create Item dialog body.
const CREATE_DIALOG = `
  <form>
    <div class="form-group"><label>Name</label>
      <div class="form-fields"><input type="text" name="name" placeholder="New Actor"></div></div>
    <div class="form-group"><label>Type</label>
      <div class="form-fields"><select name="type"><option value="character">Character</option></select></div></div>
  </form>`

test('marks text inputs and textareas already on the page', () => {
  const { document } = new JSDOM(`<body><input name="name"><input type="number"><textarea></textarea></body>`).window
  assert.equal(markFields(document.body), 3)
  for (const field of document.querySelectorAll('input, textarea')) assert.ok(field.hasAttribute(IGNORE_ATTRIBUTE))
})

test('leaves password and hidden inputs and selects unmarked', () => {
  const { document } = new JSDOM(`<body><input type="password"><input type="hidden"><select></select></body>`).window
  assert.equal(markFields(document.body), 0)
  assert.equal(document.querySelectorAll(`[${IGNORE_ATTRIBUTE}]`).length, 0)
})

test('marks the name field of a dialog rendered after start-up', async () => {
  const { window } = new JSDOM('<body></body>')
  const observer = watchFields(window.document.body)
  const dialog = window.document.createElement('dialog')
  dialog.innerHTML = CREATE_DIALOG
  window.document.body.append(dialog)
  await settle(window)
  assert.ok(window.document.querySelector('input[name="name"]').hasAttribute(IGNORE_ATTRIBUTE))
  assert.ok(!window.document.querySelector('select').hasAttribute(IGNORE_ATTRIBUTE))
  observer.disconnect()
})

test('marks a field inserted on its own', async () => {
  const { window } = new JSDOM('<body><div id="app"></div></body>')
  const observer = watchFields(window.document.body)
  const input = window.document.createElement('input')
  window.document.getElementById('app').append(input)
  await settle(window)
  assert.ok(input.hasAttribute(IGNORE_ATTRIBUTE))
  observer.disconnect()
})

test('follows an input whose type changes to and from password', async () => {
  const { window } = new JSDOM('<body><input id="secret" type="text"></body>')
  const observer = watchFields(window.document.body)
  const input = window.document.getElementById('secret')
  assert.ok(input.hasAttribute(IGNORE_ATTRIBUTE))
  input.type = 'password'
  await settle(window)
  assert.ok(!input.hasAttribute(IGNORE_ATTRIBUTE))
  input.type = 'text'
  await settle(window)
  assert.ok(input.hasAttribute(IGNORE_ATTRIBUTE))
  observer.disconnect()
})
