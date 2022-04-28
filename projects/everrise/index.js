const sdk = require('@defillama/sdk');
const http = require('../helper/http');
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");

const zeroAddress = '0x0000000000000000000000000000000000000000'
const BRIDGE_CONTROLLER = '0x0Dd4A86077dC53D5e4eAE6332CB3C5576Da51281';
const TOKEN = '0xC17c30e98541188614dF99239cABD40280810cA3';
const STAKE_HOLDING_API = 'https://app.everrise.com/bridge/api/v1/stats'
const chainConfig = {
  ethereum: {
    chainId: '1',
    LPs: [
      {
        owner: "0x33280d3a65b96eb878dd711abe9b2c0dbf740579",
        pool: "0x7250f7e97a4338d2bd72abc4b010d7a8477dc1f9",
      }, // RISE-ETH
    ],
  },
  bsc: {
    chainId: '56',
    LPs: [
      {
        owner: "0x89dd305ffbd8e684c77758288c48cdf4f4abe0f4",
        pool: "0x10dA269F5808f934326D3Dd1E04B7E7Ca78bb804",
      }, // RISE-BNB
    ],
  },
  polygon: {
    chainId: '137',
    LPs: [
      {
        owner: "0x33280d3a65b96eb878dd711abe9b2c0dbf740579",
        pool: "0xf3c62dbbfec92a2e73d676d62ebec06a6bc224e2",
      }, // RISE-MATIC
    ],
  },
  avax: {
    chainId: '43114',
    LPs: [
      {
        owner: "0x33280d3a65b96eb878dd711abe9b2c0dbf740579",
        pool: "0x5472e98d22b0fb7ec5c3e360788b8700419370b5",
      }, // RISE-AVAX
    ],
  },
  fantom: {
    chainId: '250',
    LPs: [
      {
        owner: "0x33280d3a65b96eb878dd711abe9b2c0dbf740579",
        pool: "0xde62a6cdd8d5a3988495317cffac9f3fed299383",
      }, // RISE-FTM
    ],
  },
}

async function staking(timestamp, block, chainId, chain, token) {

  const stakedAmounts = await ((await fetch(STAKE_HOLDING_API)).json());

  let stakedAmount = 0;
  for (let i = 0, ul = stakedAmounts.length; i < ul; i++) {
    if (stakedAmounts[i].id === chainId) {
      stakedAmount = BigNumber(stakedAmounts[i].amount).multipliedBy(BigNumber(10).pow(18));
    }
  }

  return stakedAmount;
}

const chainExports = {}

Object.keys(chainConfig).forEach(chain => {


  async function tvl(ts, _block, chainBlocks) {
    let balances = {}
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)

    const results = (await sdk.api.eth.getBalances({
      targets: [TOKEN, BRIDGE_CONTROLLER],
      chain, block
    }))

    for (const c of results.output)
      sdk.util.sumSingleBalance(balances, transformAddress(zeroAddress), c.balance)
    return balances
  }

  async function pool2(ts, _block, chainBlocks) {
    let balances = {}
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    const { LPs } = chainConfig[chain]

    let lpPositions = [];
    let lpBalances = (
      await sdk.api.abi.multiCall({
        calls: LPs.map((p) => ({
          target: p.pool,
          params: p.owner,
        })),
        abi: "erc20:balanceOf",
        block, chain,
      })
    ).output;
    lpBalances.forEach((i) => {
      lpPositions.push({
        balance: i.output,
        token: i.input.target,
      });
    });
    await unwrapUniswapLPs(balances, lpPositions,  block, chain, transformAddress);
    return balances
  }

  async function staking() {
    const { chainId } = chainConfig[chain]
    const stakedAmounts = await http.get(STAKE_HOLDING_API)
    let stakedAmount = stakedAmounts.find(({ id }) => id === chainId)

    return {
      'everrise': stakedAmount ? stakedAmount.amount : 0
    }
  }

  chainExports[chain] = {
    tvl,
    pool2,
    staking,
  }
})

module.exports = {
  ...chainExports,
  timetravel: false,
  methodology: "TVL comes from the buyback reserves, other token migration vaults and cross-chain bridge vaults",
};