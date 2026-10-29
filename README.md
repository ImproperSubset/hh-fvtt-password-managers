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

## Installing

In Foundry's **Add-on Modules** tab, choose **Install Module** and paste this manifest URL:

```
https://github.com/ImproperSubset/hh-fvtt-password-managers/releases/latest/download/module.json
```

Then enable **Password Manager Fixes** in each world's **Manage Modules**.

## Development

```sh
npm install
npm test   # node:test with jsdom
```

To try it, copy or link this folder into `Data/modules/hh-fvtt-password-managers` and enable it in a world.

Every push to `main` and every pull request runs [`ci.yml`](.github/workflows/ci.yml): actionlint on the workflows, a [REUSE](https://reuse.software/) licensing check, the tests, and a check that the scripts `module.json` lists exist.

## Releasing

1. Bump the version everywhere it lives, and commit:

   ```sh
   npm version 0.2.0 --no-git-tag-version   # updates package.json and package-lock.json
   # then set "version": "0.2.0" in module.json by hand
   git commit -am "Release 0.2.0"
   ```

2. Push, then publish a GitHub release whose tag is exactly the version (`0.2.0`, no `v` prefix).

The [release workflow](.github/workflows/release.yml) runs the full CI check, fails if the tag doesn't match the version in both `package.json` and `module.json`, sets the `download` URL in `module.json`, and attaches `module.json` and `module.zip` to the release. The manifest URL points at the latest release's `module.json`, so Foundry offers updates automatically.
