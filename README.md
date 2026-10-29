# Password Manager Fixes

A Foundry VTT module that stops password managers from treating Foundry's text fields as login or identity fields. Many Foundry and game-system dialogs have a field called `name`, such as the Create Actor and Create Item dialogs, and password managers match on that and offer to fill in a person's name.

The module marks every text input and textarea in the game view with each password manager's documented ignore attribute. That covers fields that are there when the game loads and fields added later, such as dialogs and sheets. Password inputs are left unmarked, so a password manager can still fill a real secret.

| Password manager | Attribute |
| --- | --- |
| 1Password | `data-1p-ignore` |
| Bitwarden | `data-bwignore` |
| Dashlane | `data-form-type="other"` |
| LastPass | `data-lpignore="true"` |
| Proton Pass | `data-protonpass-ignore` |

Bitwarden skips marked fields only when **Allow websites to exclude fields to autofill** is turned on in its autofill settings.

The module runs only in the game view. The join screen, where players pick a user and enter their password, loads no modules.

Works with Foundry VTT 12 to 14 and any game system. There are no settings.

## Development

```sh
npm install
npm test   # node:test with jsdom
```

To try it, copy or link this folder into `Data/modules/hh-fvtt-password-managers` and enable it in a world.
