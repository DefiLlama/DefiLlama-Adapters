const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const VFDepositTokenBalanceAbi = "function depositTokenBalance(address owner) view returns (uint256)"
const VFDepositTokenBalanceAutoAbi = "function balanceOf(address owner) view returns (uint256)"
const getAllOwnedAssetsAbi = require('./abis/getAllOwnedAssetsAbi.json');
const getPoolHelperAbi = "function getPoolInfo(address _address) view returns (tuple(uint256 pid, bool isActive, address token, address lp, uint256 sizeLp, address receipt, uint256 size, address rewards_addr, address helper))"
const getStakingPositionsAbi = "function getStakedPositions() view returns (tuple(address asset, bytes32 symbol, bytes32 identifier, bytes4 balanceSelector, bytes4 unstakeSelector)[])"

const assetToAddressMapping = require('./mappings/assetToAddressMapping.json')

const USDC_POOL_TUP_CONTRACT = '0x2323dAC85C6Ab9bd6a8B5Fb75B0581E31232d12b';
const USDT_POOL_TUP_CONTRACT = '0xd222e10D7Fe6B7f9608F14A8B5Cf703c74eFBcA1';
const WAVAX_POOL_TUP_CONTRACT = '0xD26E504fc642B96751fD55D3E68AF295806542f5';
const BTC_POOL_TUP_CONTRACT = '0x475589b0Ed87591A893Df42EC6076d2499bB63d0';
const ETH_POOL_TUP_CONTRACT = '0xD7fEB276ba254cD9b34804A986CE9a8C3E359148';

const SMART_LOANS_FACTORY_TUP = '0x3Ea9D480295A73fd2aF95b4D96c2afF88b21B03D';
const VF_MAINSTAKING_CONTRACT = "0x8B3d9F0017FA369cD8C164D0Cc078bf4cA588aE5";

async function tvl(timestamp, block, chainBlocks, { api }) {
  const logs = await getLogs({
    api,
    target: SMART_LOANS_FACTORY_TUP,
    topics: ['0x3c5330cb261eae74426865a348927ace59eae441485c71a110df598f825b6369'],
    fromBlock: 23431194,
  })
  sdk.log('#accounts', logs.length)

  const tokensAndOwners = [
    [assetToAddressMapping.USDC, USDC_POOL_TUP_CONTRACT],
    [assetToAddressMapping.USDT, USDT_POOL_TUP_CONTRACT],
    [assetToAddressMapping.AVAX, WAVAX_POOL_TUP_CONTRACT],
    [assetToAddressMapping.BTC, BTC_POOL_TUP_CONTRACT],
    [assetToAddressMapping.ETH, ETH_POOL_TUP_CONTRACT],
  ]

  const accounts = logs.map(i => `0x${i.topics[1].slice(26)}`)
  const positions = await api.multiCall({ abi: getStakingPositionsAbi, calls: accounts })
  const ownedAssets = await api.multiCall({ abi: getAllOwnedAssetsAbi, calls: accounts })
  const vectorTokens = {}
  const vectorAutoTokens = {}
  accounts.forEach((o, i) => {
    ownedAssets[i].forEach(tokenStr => {
      tokenStr = ethers.utils.parseBytes32String(tokenStr)
      const token = assetToAddressMapping[tokenStr]
      if (!token) throw new Error('Missing asset mapping for: ' + tokenStr)
      tokensAndOwners.push([token, o])
    })
    positions[i].forEach(({ asset, identifier }) => {
      asset = asset.toLowerCase()
      if(ethers.utils.parseBytes32String(identifier).toLowerCase().includes("auto")){
        if (!vectorAutoTokens[asset]) vectorAutoTokens[asset] = []
        vectorAutoTokens[asset].push(o)
      }else{
        if (!vectorTokens[asset]) vectorTokens[asset] = []
        vectorTokens[asset].push(o)
      }
    })
  })

  const balances = await sumTokens2({ api, tokensAndOwners: tokensAndOwners })
  await Promise.all(Object.entries(vectorTokens).map(([token, accounts]) => addVectorVaultBalances({ api, balances, accounts, token })))
  await Promise.all(Object.entries(vectorAutoTokens).map(([token, accounts]) => addVectorVaultBalancesAuto({ api, balances, accounts, token })))
  return balances;
}

function translatePlatypusLPToBaseToken(token){
  // Platypus USDC Asset (LP-USDC) -> USDC
  if(token === "0x06f01502327de1c37076bea4689a7e44279155e9"){
    token = ADDRESSES.avax.USDC;
  }
  return token;
}

// VectorFinance autocompounding vaults
async function addVectorVaultBalancesAuto({ balances, accounts, api, token }) {
  const helper = await api.call({
    abi: getPoolHelperAbi,
    target: VF_MAINSTAKING_CONTRACT,
    params: [token],
  })
  const compounder = await api.call({
    abi: 'function compounder() view returns(address)',
    target: helper.helper,
    params: []
  })
  const totalDeposits = await api.call({
    abi: 'function totalDeposits() view returns(uint256)',
    target: compounder,
    params: []
  })
  const totalSupply = await api.call({
    abi: 'function totalSupply() view returns(uint256)',
    target: compounder,
    params: []
  })
  const shareRatio = totalDeposits / totalSupply;
  let bals = await api.multiCall({ abi: VFDepositTokenBalanceAutoAbi, calls: accounts, target: compounder })
  bals = bals.map(el => el * shareRatio);

  token = translatePlatypusLPToBaseToken(token);

  bals.forEach(i => sdk.util.sumSingleBalance(balances, token, i, api.chain))
  return balances
}

// VectorFinance manual vaults
async function addVectorVaultBalances({ balances, accounts, api, token }) {
  const helper = await api.call({
    abi: getPoolHelperAbi,
    target: VF_MAINSTAKING_CONTRACT,
    params: [token],
  })
  if (helper.helper.toLowerCase() === '0x9AB2B763798124F81E95419aC9b77a4fB480742D'.toLowerCase()) return balances;
  const bals = await api.multiCall({ abi: VFDepositTokenBalanceAbi, calls: accounts, target: helper.helper })

  bals.forEach(i => sdk.util.sumSingleBalance(balances, token, i, api.chain))
  return balances
}

module.exports = {
  methodology: 'Counts TVL of DeltaPrime\'s lending pools and individual PrimeAccount contracts\'',
  start:
    24753316,
  avax: {
    tvl,
  }
}
