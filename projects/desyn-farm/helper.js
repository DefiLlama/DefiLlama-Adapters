const { getConfig } = require('../helper/cache')

const chains = ["arbitrum", "btr", "mode", "zklink", "core", "ailayer", "linea", "merlin", "scroll", "bsquared", "hemi", "bsc", "xsat", "goat", "plume_mainnet", "hsk"];
const blacklistChains = ["ethereum", "mode", "core", "ailayer", "bsquared", "hemi", "bsc", "goat", "plume_mainnet",];

const abi = {
  getBalance: "function getBalance(address) view returns (uint256)"
}

// for these pools, there is no real users deposits, just a few addresses made deposits
// ex: check tokens transfers to vaults https://etherscan.io/address/0x50834f6e27FD3b8a06Cb2c57416dd707B15b29e8#tokentxns
const blacklistPools = {
  ethereum: [
    '0x50834f6e27FD3b8a06Cb2c57416dd707B15b29e8',
  ],
  bsc: [
    '0x34fE5b3C613dF9967b4BAd53a3e58470a81781Be',
  ],
  mode: [
    '0xbfB3a640449c9a066d50062B3b4C58A0b1E34C96',
    '0x87374d884b67b209F61f8676c7053a4a0eEd3d0A',
    '0x34075F46152E2C02762D2E07da6C658583879eeF',
    '0x02A9aD4d451407faa6039f07eF596203c0DB78c0',
    '0x26f9Fa1615C7eEDc903d329Cbf74BA6d91cD9805',
  ],
  core: [
    '0x203cBBA1D9499c5e4556E88de746b72B40DC7faa', // oBTC
    '0xd4D402C9047854EEB3AC36F0eA7222377bF7889a', // oBTC
    '0x66a50e286541e1bdd10118fF0D2cb8cbB3d2Dc5c', // SolvBTC.CORE
    '0x5d2b9cDf26c5506730Ed07ABDf44C1D86f242cE3', // uBTC
    '0xb7669c77745E79cc7B46a2218A5f8E33FD1ef23A', // uBTC
    '0x5e69d826D3663094321E2cf3C387b7F9Dd7b44Bb', // 0BTC
    '0x6cB698e933f6ba140e79BFb6CB377A32b9518079', // SolvBTC.b
    '0xc017af8486D74c06443d01B2Fff16111A18F5943', // SolvBTC.m
  ],
  ailayer: [
    '0xDA8c0bb4c00C187c6DB4Cdb12ddf5b4a37B3e95d', // BFBTC
  ],
  bsquared: [
    '0x7be507eA4DD2e7885b7577fc602EeE92016aD9c6', // uBTC
    '0x4BF9D50e81Fcca18f6539e62cb57b41aFaB6244A', // uBTC
    '0xDA8c0bb4c00C187c6DB4Cdb12ddf5b4a37B3e95d', // uBTC
    '0x76657FeE7bBC6DEbdBBC90fc43925D451d11ea40', // uBTC
  ],
  hemi: [
    '0xfEE4ca2c37455c3899ba71A0D6F6Bc2b09B4c5F7',
    '0xdc1929B6A003667FA729E70f980E99464cB044f4', // enzoBTC
    '0xAE4eDB90324C56D893d13140D1F65e3DB156d3bF', // enzoBTC
  ],
  xsat: [
    '0xfEE4ca2c37455c3899ba71A0D6F6Bc2b09B4c5F7',
  ],
  goat: [
    '0xc56be1A2fE32A73605E80F6F3A7C9c6087882000',
    '0x60D113402BCFfC286e7f1E3Bb1EC3F019E038E13',
    '0x82609790F1c17d4B543BeB489fD876c74bE174d5',
    '0x21Da29187Cb9795A938F8245760D885b20B62A16',
    '0x361a744aC632626Ccb87Ce5016ab59627a2f29A5',
    '0x8eDc4116Ea12855bDE8f40Ab59AD1399B2eB9F78',
  ],
  plume_mainnet: [
    '0x882d73288D93e8CB6641a71e9D0cd76353e3f83E',
    '0x42C99c330da57524121e858Cf456305646095769',
    '0x1B34c310A6cA743ecD4c97878EAfc019129d473f',
  ],
  btr: [
    '0xBDFFCBE93309cF6C4BCBA816dDA68B88Aa8F66Ef',
    '0x16CA112D8f0727c60d9B62d42708e9EDF7aB4a17',
  ],
}

// The desyn asset arrangement needs to be requested via the rest api form
async function getInfoListPool(strategy_type, chain) {
  const data = await getConfig('desyn/' + strategy_type, `https://api.desyn.io/etf/defillama/get_pool_list?strategy_type=${strategy_type}`)
  return data.data.config[chain]?.safePools
}

// This is aSTETH, 
// before the design of the semi-closed soETH, 
// the contract in order to limit the closure of the time, 
// the user can still deposit, 
// so he was given a maximum value of the balance,
// which will become negative after adding any number, blocking the user to put in
const leverageStaking = '0x1982b2F5814301d4e9a8b0201555376e62F82428'


function getTvlFunction(strategy_type, isDoubleCounted) {
  return async (api) => {
    if (blacklistChains.includes(api.chain)) return {}

    let pools = await getInfoListPool(strategy_type, api.chain)
    pools = pools.filter(p => !blacklistPools[api.chain] || !blacklistPools[api.chain].includes(p))
    if (!pools?.length) return;
    const tokens = await api.multiCall({ abi: 'address[]:getCurrentTokens', calls: pools, permitFailure: true })
    const calls = []
    const tokensAndOwners = []
    const allTokens = []
    let i = 0

    for (const pool of pools) {
      if (tokens[i]) {
        for (const token of tokens[i]) {
          if (!isDoubleCounted) {
            tokensAndOwners.push([token, pool])
          } else {
            calls.push({ target: pool, params: token })
            allTokens.push(token)
          }
        }
      }
      i++
    }

    if (!isDoubleCounted) return api.sumTokens({ tokensAndOwners })

    const allBals = await api.multiCall({ abi: abi.getBalance, calls })
    api.add(allTokens, allBals)

    // rest api type:: StrategyType2
    if (strategy_type === 'StrategyType2')
      api.removeTokenBalance(leverageStaking)
  }
}


module.exports = {
  getTvlFunction,
  chains
}