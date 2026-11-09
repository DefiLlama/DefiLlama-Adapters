// ICON JSON-RPC transport lives in @defillama/sdk (`sdk.chains.icon`, `ICON_RPC` overrides the endpoint);
// this file keeps the TVL helpers (hex parsing into BigNumber, sumTokens).
const ADDRESSES = require('../coreAssets.json')
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js');
const { getUniqueAddresses } = require("../tokenMapping");
const { transformBalances } = require("../portedTokens");
const { sleep } = require("../utils");

const icon = sdk.chains.icon

const LOOP = new BigNumber('1000000000000000000');

function toInt(s) {
  return parseInt(s, 16)
}

function toHex(value) {
  return new BigNumber(value).div(LOOP);
}

// native ICX balance as the raw `0x` hex loop amount
async function getICXBalance(address) {
  return icon.rpc('icx_getBalance', { address })
}

// read-only `icx_call`; returns the raw hex / object unless `parseInt` (-> number) or `parseHex` (-> BigNumber ICX) is set
async function call(address, method, params, { parseInt, parseHex } = {}) {
  let result = await icon.call({ to: address, method, params })
  if (parseInt) result = toInt(result)
  if (parseHex) result = toHex(result)
  return result
}

async function sumTokens({ api, owner, owners = [], tokens = [] }) {
  if (owner) owners.push(owner)
  owner = getUniqueAddresses(owners, 'icon')
  tokens = getUniqueAddresses(tokens, 'icon')
  const toa = owners.map(owner => tokens.map(t => [t, owner])).flat()
  for (const [token, owner] of toa) {
    let balance
    if (token && token !== ADDRESSES.null)
      balance = await call(token, 'balanceOf', { _owner: owner }, { parseInt: true })
    else
      balance = await getICXBalance(owner)
    await sleep(100)
    api.add(token ?? ADDRESSES.null, balance)
  }
  return transformBalances('icon', api.getBalances())
}

function sumTokensExport(params) {
  return (api) => sumTokens({ ...params, api })
}

module.exports = {
  toInt,
  call,
  toHex,
  sumTokens,
  sumTokensExport,
}
