const sdk = require('@defillama/sdk');
const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const getAllOwnedAssetsAbi = require('./abis/getAllOwnedAssetsAbi.json');

const assetToAddressMappingAvalanche = require('./mappings/assetToAddressMappingAvalanche.json')
const assetToAddressMappingArbitrum = require('./mappings/assetToAddressMappingArbitrum.json')

// Avalanche
const USDC_POOL_TUP_CONTRACT = '0x2323dAC85C6Ab9bd6a8B5Fb75B0581E31232d12b';
const USDT_POOL_TUP_CONTRACT = '0xd222e10D7Fe6B7f9608F14A8B5Cf703c74eFBcA1';
const WAVAX_POOL_TUP_CONTRACT = '0xD26E504fc642B96751fD55D3E68AF295806542f5';
const BTC_POOL_TUP_CONTRACT = '0x475589b0Ed87591A893Df42EC6076d2499bB63d0';
const ETH_POOL_TUP_CONTRACT = '0xD7fEB276ba254cD9b34804A986CE9a8C3E359148';

const SMART_LOANS_FACTORY_TUP_AVALANCHE = '0x3Ea9D480295A73fd2aF95b4D96c2afF88b21B03D';

// Arbitrum
const USDC_POOL_TUP_ARBI_CONTRACT = '0x8FE3842e0B7472a57f2A2D56cF6bCe08517A1De0';
const ETH_POOL_TUP_ARBI_CONTRACT = '0x0BeBEB5679115f143772CfD97359BBcc393d46b3';
const BTC_POOL_TUP_ARBI_CONTRACT = '0x5CdE36c23f0909960BA4D6E8713257C6191f8C35';
const ARB_POOL_TUP_ARBI_CONTRACT = '0x2B8C610F3fC6F883817637d15514293565C3d08A';

const SMART_LOANS_FACTORY_TUP_ARBITRUM = '0xFf5e3dDaefF411a1dC6CcE00014e4Bca39265c20';

async function tvlAvalanche(timestamp, block, chainBlocks, { api }) {
  const logs = await getLogs({
    api,
    target: SMART_LOANS_FACTORY_TUP_AVALANCHE,
    topics: ['0x3c5330cb261eae74426865a348927ace59eae441485c71a110df598f825b6369'],
    fromBlock: 23431194,
  })
  sdk.log('#accounts', logs.length)

  const tokensAndOwners = [
    [assetToAddressMappingAvalanche.USDC, USDC_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.USDT, USDT_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.AVAX, WAVAX_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.BTC, BTC_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.ETH, ETH_POOL_TUP_CONTRACT],
  ]

  const accounts = logs.map(i => `0x${i.topics[1].slice(26)}`)
  await addTraderJoeLPs({ api, accounts })
  const ownedAssets = await api.multiCall({ abi: getAllOwnedAssetsAbi, calls: accounts })
  accounts.forEach((o, i) => {
    ownedAssets[i].forEach(tokenStr => {
      tokenStr = ethers.utils.parseBytes32String(tokenStr)
      const token = assetToAddressMappingAvalanche[tokenStr]
      if (!token) throw new Error('Missing asset mapping for: ' + tokenStr)
      tokensAndOwners.push([token, o])
    })
  })

  const balances = await sumTokens2({ api, tokensAndOwners: tokensAndOwners })
  return balances;
}

async function tvlArbitrum(timestamp, block, chainBlocks, { api }) {
  const logs = await getLogs({
    api,
    target: SMART_LOANS_FACTORY_TUP_ARBITRUM,
    topics: ['0x3c5330cb261eae74426865a348927ace59eae441485c71a110df598f825b6369'],
    fromBlock: 119102502,
  })
  sdk.log('#accounts', logs.length)

  const tokensAndOwners = [
    [assetToAddressMappingArbitrum.USDC, USDC_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.ETH, ETH_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.BTC, BTC_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.ARB, ARB_POOL_TUP_ARBI_CONTRACT],
  ]

  const accounts = logs.map(i => `0x${i.topics[1].slice(26)}`)
  const ownedAssets = await api.multiCall({ abi: getAllOwnedAssetsAbi, calls: accounts, })
  await addTraderJoeLPs({ api, accounts })

  accounts.forEach((o, i) => {
    ownedAssets[i].forEach(tokenStr => {
      tokenStr = ethers.utils.parseBytes32String(tokenStr)
      const token = assetToAddressMappingArbitrum[tokenStr]
      // if (!token) return;
      if (!token) throw new Error('Missing asset mapping for: ' + tokenStr)
      tokensAndOwners.push([token, o])
    })
  })

  return sumTokens2({ api, tokensAndOwners: tokensAndOwners });
}

async function addTraderJoeLPs({ api, accounts }) {
  const pairSet = new Set()
  const bins = await api.multiCall({ abi: 'function getOwnedTraderJoeV2Bins() public view returns (tuple(address pair, uint24 bin)[])', calls: accounts })
  const calls = []
  bins.forEach((res, i) => {
    const account = accounts[i]
    res.forEach(({ pair, bin }) => {
      pair = pair.toLowerCase()
      pairSet.add(pair)
      calls.push({ target: pair, bin, account })
    })
  })
  const pairs = [...pairSet]
  const tokenXs = await api.multiCall({ abi: 'function getTokenX() view returns (address)', calls: pairs })
  const tokenYs = await api.multiCall({ abi: 'function getTokenY() view returns (address)', calls: pairs })
  const pairInfos = {}
  pairs.forEach((pair, i) => {
    pairInfos[pair] = {
      tokenX: tokenXs[i],
      tokenY: tokenYs[i],
    }
  })
  const bals = await api.multiCall({ abi: 'function balanceOf(address, uint256) view returns (uint256)', calls: calls.map(({ target, account, bin }) => ({ target, params: [account, bin] })) })
  const binBals = await api.multiCall({ abi: 'function getBin(uint24) view returns (uint128 tokenXbal,uint128 tokenYBal)', calls: calls.map(({ target, account, bin }) => ({ target, params: [bin] })) })
  const binSupplies = await api.multiCall({ abi: 'function totalSupply(uint256) view returns (uint256)', calls: calls.map(({ target, account, bin }) => ({ target, params: [bin] })) })
  binBals.forEach(({tokenXbal, tokenYBal}, i) => {
    const { tokenX, tokenY } = pairInfos[calls[i].target]
    const ratio = bals[i] / binSupplies[i]
    api.add(tokenX, tokenXbal * ratio)
    api.add(tokenY, tokenYBal * ratio)
  })

}

module.exports = {
  methodology: 'Counts TVL of DeltaPrime\'s lending pools and individual PrimeAccount contracts\'',
  start:
    24753316,
  avax: {
    tvl: tvlAvalanche,
  },
  arbitrum: {
    tvl: tvlArbitrum,
  }
}