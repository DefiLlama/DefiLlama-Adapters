const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const { stakings } = require("../helper/staking");
const abi = require("./abi.json");
const { sumTokens2, } = require('../helper/unwrapLPs');

const ichiLegacy = "0x903bEF1736CDdf2A537176cf3C64579C3867A881";
const ichi = "0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6";
const xIchi = "0x70605a6457B0A8fBf1EEE896911895296eAB467E";
const farmContract = "0x275dFE03bc036257Cd0a713EE819Dbd4529739c8";
const ichiLending = "0xaFf95ac1b0A78Bd8E4f1a2933E373c66CC89C0Ce";

const poolWithTokens = [
  // BANCOR
  ["0x4a2F0Ca5E03B2cF81AebD936328CF2085037b63B", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"]],
  // ONE INCH
  ["0x1dcE26F543E591c27717e25294AEbbF59AD9f3a5", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x111111111117dC0aa78b770fA6A738034120C302"]],
  // BALANCER
  ["0x58378f5F8Ca85144ebD8e1E5e2ad95B02D29d2BB", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", ADDRESSES.ethereum.WETH]]
]

module.exports = {
  methodology: "Tokens deposited to mint oneTokens excluding oneTokens , Vault deposits",
  misrepresentedTokens: true,
  doublecounted: true,
} // node test.js projects/ichifarm/index.js

const defaultEvent = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint24 fee, uint256 count)'
const defaultTopic = '0xde147f43b6837f282eee187234c866cf001806167325f3ea883e36bed0c16a20'

const config = {
  ethereum: {
    vaultConfigs: [
      { factory: '0x5a40DFaF8C1115196A1CDF529F97122030F26112', fromBlock: 13671610, },
    ],
    oneFactory: '0xD0092632B9Ac5A7856664eeC1abb6E3403a6A36a',
  },
  arbitrum: {
    vaultConfigs: [
      { factory: '0xfBf38920cCbCFF7268Ad714ae5F9Fad6dF607065', fromBlock: 102858581, },
    ],
  },
  bsc: {
    vaultConfigs: [
      { factory: '0xbBB97d634460DACCA0d41E249510Bb741ef46ad3', fromBlock: 29702590, },
    ],
  },
  polygon: {
    vaultConfigs: [
      { factory: '0x2d2c72c4dc71aa32d64e5142e336741131a73fc0', fromBlock: 25697834, },
      { factory: '0xb2f44D8545315cDd0bAaB4AC7233218b932a5dA7', fromBlock: 44370370, }, // v2-retro
    ],
    oneFactory: '0x101eB16BdbA37979a771c86e1CAAfbaDbABfc879',
  },
}

Object.keys(config).forEach(chain => {
  const { vaultConfigs = [], oneFactory } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const blacklistedTokens = []
      if (oneFactory) {
        const oneTokens = await api.fetchList({ lengthAbi: abi.oneTokenCount, itemAbi: abi.oneTokenAtIndex, target: oneFactory })
        const oneTokenOwners = await api.multiCall({ abi: abi.owner, calls: oneTokens })
        const foreignTokens = await api.fetchList({ lengthAbi: abi.foreignTokenCount, itemAbi: abi.foreignTokenAtIndex, target: oneFactory })
        const modulesList = await api.fetchList({ lengthAbi: abi.moduleCount, itemAbi: abi.moduleAtIndex, target: oneFactory })
        const moduleDetails = await api.multiCall({ abi: abi.modules, calls: modulesList, target: oneFactory })

        const strategiesList = []
        moduleDetails.forEach((data, i) => {
          if (data.moduleType == 2) { //modeuleType 2 are strategies
            strategiesList.push(modulesList[i])
          }
        })
        if (api.chain === 'polygon') {
          foreignTokens.push(ichi)
        }

        blacklistedTokens.push(...oneTokens.map(i => i.toLowerCase()))
        await sumTokens2({ api, tokens: foreignTokens, owners: [oneTokens, strategiesList].flat(), blacklistedTokens })
        const uniV3NFTHolders = [...strategiesList, ...oneTokenOwners]

        await sumTokens2({ api, owners: uniV3NFTHolders, resolveUniV3: true, blacklistedTokens, })
      }

      for (const { factory, fromBlock, topic = defaultTopic, eventAbi = defaultEvent } of vaultConfigs) {
        const logs = await getLogs({
          api,
          target: factory,
          topics: [topic],
          eventAbi: eventAbi,
          onlyArgs: true,
          fromBlock,
        })
        const vaultBalances = await api.multiCall({ abi: abi.getTotalAmounts, calls: logs.map(l => l.ichiVault) })
        vaultBalances.forEach((b, i) => {
          const { tokenA, tokenB } = logs[i]
          if (!blacklistedTokens.includes(tokenA.toLowerCase())) api.add(tokenA, b.total0)
          if (!blacklistedTokens.includes(tokenB.toLowerCase())) api.add(tokenB, b.total1)
        })
      }

      return api.getBalances()
    }
  }
})

module.exports.ethereum.pool2 = async (_, block) => {
  const toa = [
    ['0x9cd028b1287803250b1e226f0180eb725428d069', farmContract],
    ['0xd07d430db20d2d7e0c4c11759256adbcc355b20c', farmContract],
  ]
  poolWithTokens.forEach(([o, tokens]) => tokens.forEach(t => toa.push([t, o])))
  return sumTokens2({ tokensAndOwners: toa, block, })
}

module.exports.ethereum.staking = stakings([xIchi, ichiLending], ichiLegacy)
