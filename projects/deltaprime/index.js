const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk');

const getAllOwnedAssetsAbi = "function getAllOwnedAssets() view returns (bytes32[] result)"
const getLoansAbi = "function getLoans(uint256 _from, uint256 _count) view returns (address[] _loans)"
const getPrimeAccountsLengthAbi = 'uint256:getLoansLength';
const ggAVAXBalancerBalanceAbi = "function balancerGgAvaxBalance() view returns (uint256)"
const yyAVAXBalancerBalanceAbi = "function balancerYyAvaxBalance() view returns (uint256)"
const sAVAXBalancerBalanceAbi = "function balancerSAvaxBalance() view returns (uint256)"

const yieldYakWombatAvaxBalanceInWombatAvaxSavaxLP = "function avaxBalanceAvaxSavaxYY() view returns (uint256)"
const yieldYakWombatSAvaxBalanceInWombatAvaxSavaxLP = "function sAvaxBalanceAvaxSavaxYY() view returns (uint256)"
const yieldYakWombatsAvaxBalanceInWombatAvaxGgavaxLP = "function avaxBalanceAvaxGgavaxYY() view returns (uint256)"
const yieldYakWombatsGgavaxBalanceInWombatAvaxGgavaxLP = "function ggAvaxBalanceAvaxGgavaxYY() view returns (uint256)"

const assetToAddressMappingAvalanche = require('./mappings/assetToAddressMappingAvalanche.json')
const assetToAddressMappingArbitrum = require('./mappings/assetToAddressMappingArbitrum.json')

// Avalanche
const USDC_POOL_TUP_CONTRACT = '0x8027e004d80274FB320e9b8f882C92196d779CE8';
const USDT_POOL_TUP_CONTRACT = '0x1b6D7A6044fB68163D8E249Bce86F3eFbb12368e';
const WAVAX_POOL_TUP_CONTRACT = '0xaa39f39802F8C44e48d4cc42E088C09EDF4daad4';
const BTC_POOL_TUP_CONTRACT = '0x70e80001bDbeC5b9e932cEe2FEcC8F123c98F738';
const ETH_POOL_TUP_CONTRACT = '0x2A84c101F3d45610595050a622684d5412bdf510';

const SMART_LOANS_FACTORY_TUP_AVALANCHE = '0x3Ea9D480295A73fd2aF95b4D96c2afF88b21B03D';

// Arbitrum
const USDC_POOL_TUP_ARBI_CONTRACT = '0x8Ac9Dc27a6174a1CC30873B367A60AcdFAb965cc';
const ETH_POOL_TUP_ARBI_CONTRACT = '0x788A8324943beb1a7A47B76959E6C1e6B87eD360';
const BTC_POOL_TUP_ARBI_CONTRACT = '0x0ed7B42B74F039eda928E1AE6F44Eed5EF195Fb5';
const ARB_POOL_TUP_ARBI_CONTRACT = '0xC629E8889350F1BBBf6eD1955095C2198dDC41c2';
const DAI_POOL_TUP_ARBI_CONTRACT = '0xFA354E4289db87bEB81034A3ABD6D465328378f1';

const SMART_LOANS_FACTORY_TUP_ARBITRUM = '0xFf5e3dDaefF411a1dC6CcE00014e4Bca39265c20';

async function tvlAvalanche(api) {
  const tokensAndOwners = [
    [assetToAddressMappingAvalanche.USDC, USDC_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.USDT, USDT_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.AVAX, WAVAX_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.BTC, BTC_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.ETH, ETH_POOL_TUP_CONTRACT],
  ]

  let accounts = [];
  const numberOfAccounts = await api.call({ abi: getPrimeAccountsLengthAbi, target: SMART_LOANS_FACTORY_TUP_AVALANCHE, });
  const batchSize = 500;
  let batchIndex = 0;
  while (batchIndex * batchSize < numberOfAccounts) {
    let batchPrimeAccounts = await api.call({
      abi: getLoansAbi,
      target: SMART_LOANS_FACTORY_TUP_AVALANCHE,
      params: [batchIndex * batchSize, batchSize]
    })
    accounts = accounts.concat(batchPrimeAccounts);
    batchIndex++;
  }

  sdk.log(accounts.length)

  await addTraderJoeLPs({ api, accounts })
  const ownedAssets = await api.multiCall({ abi: getAllOwnedAssetsAbi, calls: accounts })
  accounts.forEach((o, i) => {
    ownedAssets[i].forEach(tokenStr => {
      tokenStr = ethers.decodeBytes32String(tokenStr)
      const token = assetToAddressMappingAvalanche[tokenStr]
      if (!token) {
        sdk.log('Missing asset mapping for: ' + tokenStr)
        return;
      }
      if (!token) throw new Error('Missing asset mapping for: ' + tokenStr)
      tokensAndOwners.push([token, o])
    })
  })

  const balances = await sumTokens2({ api, tokensAndOwners: tokensAndOwners })

  let ggAvaxBalancerBalances = await api.multiCall({ abi: ggAVAXBalancerBalanceAbi, calls: accounts })
  let yyAvaxBalancerBalances = await api.multiCall({ abi: yyAVAXBalancerBalanceAbi, calls: accounts })
  let sAvaxBalancerBalances = await api.multiCall({ abi: sAVAXBalancerBalanceAbi, calls: accounts })

  let avaxYYWombatAvaxSAvaxLPBalances = await api.multiCall({ abi: yieldYakWombatAvaxBalanceInWombatAvaxSavaxLP, calls: accounts })
  let savaxYYWombatAvaxSAvaxLPBalances = await api.multiCall({ abi: yieldYakWombatSAvaxBalanceInWombatAvaxSavaxLP, calls: accounts })
  let avaxYYWombatAvaxGgavaxLPBalances = await api.multiCall({ abi: yieldYakWombatsAvaxBalanceInWombatAvaxGgavaxLP, calls: accounts })
  let ggAaxYYWombatAvaxGgavaxLPBalances = await api.multiCall({ abi: yieldYakWombatsGgavaxBalanceInWombatAvaxGgavaxLP, calls: accounts })

  ggAvaxBalancerBalances.forEach(i => sdk.util.sumSingleBalance(balances, assetToAddressMappingAvalanche["BAL_ggAVAX_AVAX"], i, api.chain))
  yyAvaxBalancerBalances.forEach(i => sdk.util.sumSingleBalance(balances, assetToAddressMappingAvalanche["BAL_yyAVAX_AVAX"], i, api.chain))
  sAvaxBalancerBalances.forEach(i => sdk.util.sumSingleBalance(balances, assetToAddressMappingAvalanche["BAL_sAVAX_AVAX"], i, api.chain))

  avaxYYWombatAvaxSAvaxLPBalances.forEach(i => sdk.util.sumSingleBalance(balances, assetToAddressMappingAvalanche["WOMBAT_sAVAX_AVAX_LP_AVAX"], i, api.chain))
  savaxYYWombatAvaxSAvaxLPBalances.forEach(i => sdk.util.sumSingleBalance(balances, assetToAddressMappingAvalanche["WOMBAT_sAVAX_AVAX_LP_sAVAX"], i, api.chain))
  avaxYYWombatAvaxGgavaxLPBalances.forEach(i => sdk.util.sumSingleBalance(balances, assetToAddressMappingAvalanche["WOMBAT_ggAVAX_AVAX_LP_AVAX"], i, api.chain))
  ggAaxYYWombatAvaxGgavaxLPBalances.forEach(i => sdk.util.sumSingleBalance(balances, assetToAddressMappingAvalanche["WOMBAT_ggAVAX_AVAX_LP_ggAVAX"], i, api.chain))

  return balances;
}

async function tvlArbitrum(api) {
  const tokensAndOwners = [
    [assetToAddressMappingArbitrum.USDC, USDC_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.ETH, ETH_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.BTC, BTC_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.ARB, ARB_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.DAI, DAI_POOL_TUP_ARBI_CONTRACT],
  ]

  let accounts = [];
  const numberOfAccounts = await api.call({ abi: getPrimeAccountsLengthAbi, target: SMART_LOANS_FACTORY_TUP_ARBITRUM, });
  const batchSize = 500;
  let batchIndex = 0;
  while (batchIndex * batchSize < numberOfAccounts) {
    let batchPrimeAccounts = await api.call({
      abi: getLoansAbi,
      target: SMART_LOANS_FACTORY_TUP_ARBITRUM,
      params: [batchIndex * batchSize, batchSize]
    })
    accounts = accounts.concat(batchPrimeAccounts);
    batchIndex++;
  }

  sdk.log(accounts.length)
  const ownedAssets = await api.multiCall({ abi: getAllOwnedAssetsAbi, calls: accounts, })
  await addTraderJoeLPs({ api, accounts })

  accounts.forEach((o, i) => {
    ownedAssets[i].forEach(tokenStr => {
      tokenStr = ethers.decodeBytes32String(tokenStr)
      const token = assetToAddressMappingArbitrum[tokenStr]
      if (!token) return;
      if (!token) {
        sdk.log('Missing asset mapping for: ' + tokenStr)
        return;
      }
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
  binBals.forEach(({ tokenXbal, tokenYBal }, i) => {
    const { tokenX, tokenY } = pairInfos[calls[i].target]
    const ratio = bals[i] / binSupplies[i]
    api.add(tokenX, tokenXbal * ratio)
    api.add(tokenY, tokenYBal * ratio)
  })

}

module.exports = {
  methodology: 'Counts TVL of DeltaPrime\'s lending pools and individual PrimeAccount contracts\'',
  avax: {
    tvl: tvlAvalanche,
  },
  arbitrum: {
    tvl: tvlArbitrum,
  }
}