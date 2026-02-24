const sdk = require("@defillama/sdk");
const abi = {
    "see_s1ftm_circ": "uint256:see_s1ftm_circ",
    "see_s1tomb_circ": "uint256:see_s1tomb_circ"
  };
const contracts = {
    "ftmVault": "0x3d2fa78f5e1aa2e7f29c965d0e22b32b8d5f14a9",
    "tombVault": "0xA222fb9D2A811FAb3B334a5a9FA573C11fee73c1",
    "avaxVault": "0x1689D5C5866909569a98B35da6A24090e4931C17",
    "ethVault": "0xf9448f9a932474B5cAd9F05b86EA12376f2Fd770",
    "Collateral": "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
    "FTM": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "AVAX": "0x511D35c52a3C244E7b8bd92c0C297755FbD89212",
    "TOMB": "0x6c021ae822bea943b2e66552bde1d2696a53fbb7",
    "WETH": "0x74b23882a30290451A17c44f4F05243b6b58C76d",
    "DAI": "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
    "pool2": "0x56995c729296c634cA367F8F3e5E5dEFF30D4511",
    "daiPool2": "0x629670EAA62952990dd5b0658Ab6c6296fE2111b",
    "ftmPool2": "0x4bd9B32677821939937FaDaEb30858806578339c"
  };
const { pool2 } = require("../helper/pool2");
const vaults = [
  contracts.ftmVault,
  contracts.ethVault,
  contracts.avaxVault,
  contracts.tombVault,
]

const tokens = [
  contracts.FTM,
  contracts.WETH,
  contracts.AVAX,
  contracts.TOMB,
]

async function tvl(api) {
  const _tokens = [...tokens]
  const owners = [...vaults, ...vaults]
  vaults.forEach(v => _tokens.push(contracts.Collateral))
  return api.sumTokens({ tokensAndOwners2: [_tokens, owners] })
}

async function borrowed(api) {
  const vaults0 = vaults.slice(0, 2);
  const vaults1 = vaults.slice(2);
  const tokens0 = tokens.slice(0, 2);
  const tokens1 = tokens.slice(2);
  const balances = await api.multiCall({ abi: abi.see_s1ftm_circ, calls: vaults0 })
  const balances1 = await api.multiCall({ abi: abi.see_s1tomb_circ, calls: vaults1 })
  api.addTokens(tokens0, balances)
  api.addTokens(tokens1, balances1)

  const chainApi = new sdk.ChainApi({ chain: api.chain, block: api.block })
  chainApi.sumTokens({ tokensAndOwners2: [tokens, vaults] })
  Object.entries(chainApi.getBalances()).forEach(([token, balance]) => {
    api.add(token, balance * -1, { skipChain: true })
  })
  return api.getBalances()
}

module.exports = {
  fantom: {
    tvl,
    borrowed,
    pool2: pool2(
      [contracts.pool2, contracts.pool2],
      [contracts.daiPool2, contracts.ftmPool2],
    )
  }
}
