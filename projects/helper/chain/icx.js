const ADDRESSES = require('../coreAssets.json')
const { post } = require("../http");
const BigNumber = require('bignumber.js');
const { getUniqueAddresses } = require("../tokenMapping");
const { transformBalances } = require("../portedTokens");
const { sleep } = require("../utils");

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3';

const LOOP = new BigNumber('1000000000000000000');

function toInt(s) {
  return parseInt(s, 16)
}

function toHex(value) {
  return new BigNumber(value).div(LOOP);
}

async function getICXBalance(address) {
  let response = await post(icxApiEndpoint, {
    jsonrpc: '2.0',
    method: 'icx_getBalance',
    id: 1234,
    params: { address }
  })
  return response.result
}

async function call(address, method, params, { parseInt, parseHex } = {}) {
  let response = await post(icxApiEndpoint, {
    jsonrpc: '2.0',
    method: 'icx_call',
    id: 1234,
    params: {
      to: address,
      dataType: 'call',
      data: {
        method: method,
        params: params
      }
    }
  })
  if (parseInt) response.result = toInt(response.result)
  if (parseHex) response.result = toHex(response.result)
  return response.result
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