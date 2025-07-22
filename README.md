# Defillama Adapters

Follow [this guide](https://docs.llama.fi/submit-a-project) to create an adapter and submit a PR with it.

Also, don't hesitate to send a message on [our discord](https://discord.defillama.com/) if we're late to merge your PR.

> If you would like to add a `volume` adapter please submit the PR [here](https://github.com/DefiLlama/adapters)
> - If you would like to add a `liquidations` adapter, please refer to [this readme document](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/liquidations) for details.

1. PLEASE PLEASE **enable "Allow edits by maintainers" while putting up the PR.**
2. Once your adapter has been merged, it takes time to show on the UI. No need to notify us on Discord.
3. TVL must be computed from blockchain data (reason: https://github.com/DefiLlama/DefiLlama-Adapters/discussions/432), if you have trouble with creating the adapter, please hop onto our discord, we are happy to assist you.
4. **For updating listing info** It is a different repo, you can find your listing in this file: https://github.com/DefiLlama/defillama-server/blob/master/defi/src/protocols/data2.ts, you can  edit it there and put up a PR
5. Do not edit/push `package-lock.json` file as part of your changes, we use lockfileVersion 2, and most use v1 and using that messes up our CI
6. No need to go to our discord and announce that you've created a PR, we monitor all PRs and will review it asap

## Getting listed

Please send answers to questions there https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/pull_request_template.md when creating a PR.

## Work in progress

This is a work in progress. DefiLlama aims to be transparent, accurate, and open source.

If you have any suggestions, want to contribute or want to chat, please join [our discord](https://discord.defillama.com/) and drop a message.

## Testing adapters
```bash
node test.js projects/pangolin/index.js
# Add a timestamp at the end to run the adapter at a historical timestamp
node test.js projects/aave/v3.js 1729080692
# or using YYYY-MM-DD
node test.js projects/aave/v3.js 2024-10-16
```

## Changing RPC providers
If you want to change RPC providers because you need archive node access or because the default ones don't work well enough you can do so by creating an `.env` file and filling it with the env variables to overwrite:
```
ETHEREUM_RPC="..."
BSC_RPC="..."
POLYGON_RPC="..."
```

The name of each rpc is `{CHAIN-NAME}_RPC`, and the name we use for each chain can be found [here](https://unpkg.com/@defillama/sdk@latest/build/providers.json). If you run into issues with a chain make sure to update the sdk with `npm update @defillama/sdk`.

## Adapter rules
- Never add extra npm packages, if you need a chain-level package for your chain, ask us, and we'll consider it, but we can't accept any npm package that is project-specific
