const { default: axios } = require("axios");
const {
  sumTokens,
} = require("../helper/unwrapLPs");
const {
  getChainTransform
} = require("../helper/portedTokens.js");

const chainConfig = {
  ethereum: {
    owner: ['0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F',],
    rvst: '0x120a3879da835a5af037bb2d1456bebd6b54d4ba',
    pool2Token: '0x6490828bd87be38279a36f029f3b9af8b4e14b49',
    chainId: 1,
  },
  polygon: {
    owner: ['0x3cCc20d960e185E863885913596b54ea666b2fe7',],
    chainId: 137,
  },
  fantom: {
    owner: ['0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf',],
    chainId: 250,
  },
  avax: {
    owner: ['0x955a88c27709a1EEf4ACa0df0712c67B48240919',],
    chainId: 43114,
  },
}

const getTokens = async chainId => {
  let url = 'https://defi-llama-feed.vercel.app/api/address'
  if (chainId) url = `${url}?chainId=${chainId}`
  return (await axios.get(url)).data.body
}

const moduleExports = Object.keys(chainConfig).reduce((agg, chain) => {
  const { chainId, owner, pool2Token, rvst } = chainConfig[chain]

  let staking, pool2
  async function tvl(ts, _block, chainBlocks) {
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    const tokens = (await getTokens(chainId)).map(token => token.toLowerCase()).filter(token => ![rvst, pool2Token].includes(token))

    const balances = {}
    const tokensAndOwners = []
    tokens.map(token => owner.map(o => tokensAndOwners.push([token, o])))
    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveCrv: true, resolveLP: true, resolveYearn: true })
    return balances
  }

  if (rvst)
    staking = async (ts, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      const transformAddress = await getChainTransform(chain)
      const balances = {}
      const tokensAndOwners = owner.map(o => [rvst, o])
      await sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveCrv: true, resolveLP: true, resolveYearn: true })
      return balances
    }

  if (pool2Token)
    pool2 = async (ts, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      const transformAddress = await getChainTransform(chain)
      const balances = {}
      const tokensAndOwners = owner.map(o => [pool2Token, o])
      await sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveCrv: true, resolveLP: true, resolveYearn: true })
      return balances
    }

  agg[chain] = { tvl, staking, pool2 }

  return agg
}, {})

module.exports = {
  methodology: "We list all tokens in our vault and sum them together",

  ...moduleExports
};
