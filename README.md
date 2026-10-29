# 1Password Fixes

A Foundry VTT module that stops 1Password from treating Foundry's text fields as login or identity fields. Many Foundry and game-system dialogs have a field called `name`, such as the Create Actor and Create Item dialogs. 1Password matches on that and offers to fill in a person's name.

The module adds 1Password's documented ignore attribute, [`data-1p-ignore`](https://www.1password.dev/web/compatible-website-design/), to every text input and textarea in the game view. That covers fields that are there when the game loads and fields added later, such as dialogs and sheets. Password inputs are left unmarked, so 1Password can still fill a real secret.

Works with Foundry VTT 12 to 14 and any game system. There are no settings.

## Development

```sh
npm install
npm test   # node:test with jsdom
```

To try it, copy or link this folder into `Data/modules/hh-fvtt-1password` and enable it in a world.
