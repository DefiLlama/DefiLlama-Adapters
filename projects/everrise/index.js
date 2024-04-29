const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const http = require('../helper/http');
const { getConfig } = require('../helper/cache')
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs, nullAddress, sumTokens2 } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const getPairFactory = 'function getPair(address, address) view returns (address)'

const zeroAddress = ADDRESSES.null
const BRIDGE_CONTROLLER = '0x0Dd4A86077dC53D5e4eAE6332CB3C5576Da51281';
const RESERVES = [
  // '0x78b939518f51b6da10afb3c3238Dd04014e00057',
  '0x3776B8C349BC9Af202E4D98Af163D59cA56d2fC5'];
const TOKEN = '0xC17c30e98541188614dF99239cABD40280810cA3';
const STAKE_HOLDING_API = 'https://app.everrise.com/bridge/api/v1/stats'
const EVEROWN_DAO_API = 'https://app.everrise.com/prod/api/v1/contracts/active'
const chainConfig = {
  ethereum: {
    chainId: '1',
    WCoin: ADDRESSES.ethereum.WETH,
    lpFactory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    LPs: [
      {
        owner: "0x78ab99dae7302ea91e36962f4b23418a89d3a69d", // EverOwn DAO Locked LP
        pool: "0x7250f7e97a4338d2bd72abc4b010d7a8477dc1f9",
      }, // RISE-ETH
    ],
    reserveTokens: [
      ADDRESSES.ethereum.USDT, // USDT
      ADDRESSES.ethereum.USDC, // USDC
      // TOKEN,
    ],
  },
  bsc: {
    chainId: '56',
    WCoin: ADDRESSES.bsc.WBNB,
    lpFactory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    LPs: [
      {
        owner: "0x89dd305ffbd8e684c77758288c48cdf4f4abe0f4", // EverOwn DAO Locked LP
        pool: "0x10dA269F5808f934326D3Dd1E04B7E7Ca78bb804",
      }, // RISE-BNB
    ],
    reserveTokens: [
      ADDRESSES.bsc.USDT, // USDT
      ADDRESSES.bsc.USDC, // USDC
      ADDRESSES.bsc.BUSD, // BUSD
      // TOKEN,
    ],
  },
  polygon: {
    chainId: '137',
    WCoin: ADDRESSES.polygon.WMATIC_2,
    lpFactory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    LPs: [
      {
        owner: "0x7dd45e9be23219fd8ccfc584b652775aba62fdef", // EverOwn DAO Locked LP
        pool: "0xf3c62dbbfec92a2e73d676d62ebec06a6bc224e2",
      }, // RISE-MATIC
    ],
    reserveTokens: [
      ADDRESSES.polygon.USDT, // USDT
      ADDRESSES.polygon.USDC, // USDC
      // TOKEN,
    ],
  },
  avax: {
    chainId: '43114',
    WCoin: ADDRESSES.avax.WAVAX,
    lpFactory: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
    LPs: [
      {
        owner: "0x22a8e3f957fcdd4883cfcbc67c5e14cf2bb6477d", // EverOwn DAO Locked LP
        pool: "0x5472e98d22b0fb7ec5c3e360788b8700419370b5",
      }, // RISE-AVAX
    ],
    reserveTokens: [
      ADDRESSES.avax.USDt, // USDT
      ADDRESSES.avax.USDC, // USDC
      // TOKEN,
    ],
  },
  fantom: {
    chainId: '250',
    WCoin: ADDRESSES.fantom.WFTM,
    lpFactory: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3',
    LPs: [
      {
        owner: "0x59503632ab8a093c266509c797c957e063f4d32b", // EverOwn DAO Locked LP
        pool: "0xde62a6cdd8d5a3988495317cffac9f3fed299383",
      }, // RISE-FTM
    ],
    reserveTokens: [
      ADDRESSES.fantom.USDC, // USDC
      // TOKEN,
    ],
  },
}

const chainExports = {}
let daoLockerClients = null

Object.keys(chainConfig).forEach(chain => {
  const chainData = chainConfig[chain]

  async function tvl(api) {
    const tokensAndOwners = [
      [nullAddress, TOKEN],
      ...RESERVES.map(i => [nullAddress, i])
    ]
    chainConfig[chain].reserveTokens.forEach(t => RESERVES.forEach(o => tokensAndOwners.push([t, o])))

    await sumTokens2({ api, tokensAndOwners })
    await everOwnClients(api)

    return api.getBalances()
  }

  async function everOwnClients(api) {
    daoLockerClients = daoLockerClients || await getConfig('everrise/tvl', EVEROWN_DAO_API)

    let clients = daoLockerClients[chainData.chainId] || []
    // Don't include self as that's pool2
    clients = clients.filter(t => t.contractAddress.toLowerCase() !== TOKEN.toLowerCase())

    if (clients.length > 0) {
      const clientMapping = {}

      clients.forEach(client => {
        clientMapping[client.contractAddress.toLowerCase()] = client.everOwnLocker
      })
      const calls = clients.map((client) => ({
        target: chainData.lpFactory,
        params: [client.contractAddress.toLowerCase(), chainData.WCoin],
      }))

      const lPTokens = (await api.multiCall({ abi: getPairFactory, calls, }))
      const tokensAndOwners = lPTokens.map((v, i) => [v, clients[i].everOwnLocker])
      return sumTokens2({ api, tokensAndOwners, resolveLP: true, })
    }
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
    await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);
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