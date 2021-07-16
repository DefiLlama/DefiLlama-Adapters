const { unwrapUniswapLPs } = require('../helper/unwrapLPs');

const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const abi = require("./index.json")

const TYPE_TOKEN = 0
const TYPE_LP = 1

const CHAIN_HECO = 'heco'


const farms = [
  {
    name: "WAR-HT",
    type: TYPE_LP,
    address: '0xE22da09d0B847291076bF5691a9D3908eB8CbAFe',
    token: '0xE4E55C9203Ac398A0F0B98BD096B70D9778eCa6A',
    chain: CHAIN_HECO,
  },
  {
    name: "WAR",
    type: TYPE_TOKEN,
    address: '0xF01f44B1b5770d3c5dc54FE1455786d1227736CC',
    token: '0x910651F81a605a6Ef35d05527d24A72fecef8bF0',
    chain: CHAIN_HECO,
  },
  {
    name: "PAUL-USDT",
    type: TYPE_LP,
    address: '0x5b0F4cb9041cED035Fd0a7Db3c0C2f7f4dC62A66',
    token: '0xD9baBF51f327829264f554B4Fa4e12Cec5BD0F50',
    chain: CHAIN_HECO,
  },
]

async function tvl(timestamp, block) {
  const balances = {}
  for (let i = 0; i < farms.length; i++) {
    const farm = farms[i]
    let {token, address, type, chain} = farm
    token = token.toLowerCase()
    address = address.toLowerCase()

    const balanceStones = await sdk.api.abi.call({
      abi: abi['totalSupply'],
      target: address,
      chain,
    })

    if (type === TYPE_TOKEN) {
      if (typeof balances[`${chain}:${token}`] === 'undefined') {
        Object.assign(balances, {
          [`${chain}:${token}`]: balanceStones.output
        })
      } else {
        balances[`${chain}:${token}`] = new BigNumber(balances[`${chain}:${token}`]).plus(new BigNumber(balanceStones.output)).toFixed(0)
      }
    } else if (type === TYPE_LP) {
      let _balances = {}
      await unwrapUniswapLPs(_balances, [{
        token,
        balance: balanceStones.output,
      }],'latest', CHAIN_HECO)

      for(const _token in _balances){
        const _value = _balances[_token]
        if (typeof balances[`${chain}:${_token}`] === 'undefined') {
          Object.assign(balances, {
            [`${chain}:${_token}`]: _value
          })
        }else {
          balances[`${chain}:${token}`] = new BigNumber(balances[`${chain}:${token}`]).plus(new BigNumber(_value)).toFixed(0)
        }
      }
    }
  }
  return balances;
}

module.exports = {
  heco: {
    tvl,
  },
  tvl
}