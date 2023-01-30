const sdk = require('@defillama/sdk');
const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')

const VFDepositTokenBalanceAbi = "function depositTokenBalance(address owner) view returns (uint256)"
const getAllOwnedAssetsAbi = require('./abis/getAllOwnedAssetsAbi.json');
const getAllLoansAbi = "address[]:getAllLoans"
const getPoolHelperAbi = "function getPoolInfo(address _address) view returns (tuple(uint256 pid, bool isActive, address token, address lp, uint256 sizeLp, address receipt, uint256 size, address rewards_addr, address helper))"

const assetToAddressMapping = require('./mappings/assetToAddressMapping.json')

const USDC_POOL_TUP_CONTRACT = '0x2323dAC85C6Ab9bd6a8B5Fb75B0581E31232d12b';
const WAVAX_POOL_TUP_CONTRACT = '0xD26E504fc642B96751fD55D3E68AF295806542f5';
const SMART_LOANS_FACTORY_TUP = '0x3Ea9D480295A73fd2aF95b4D96c2afF88b21B03D';
const VF_MAINSTAKING_CONTRACT = "0x8B3d9F0017FA369cD8C164D0Cc078bf4cA588aE5";

const vectorTokens = [
  assetToAddressMapping.USDC,
  assetToAddressMapping.AVAX,
  assetToAddressMapping.sAVAX,
]

async function tvl(timestamp, block, chainBlocks, { api }) {
  const tokensAndOwners = [
    [assetToAddressMapping.USDC, USDC_POOL_TUP_CONTRACT],
    [assetToAddressMapping.AVAX, WAVAX_POOL_TUP_CONTRACT],
  ]

  const accounts = await api.call({ abi: getAllLoansAbi, target: SMART_LOANS_FACTORY_TUP })
  const ownedAssets = await api.multiCall({ abi: getAllOwnedAssetsAbi, calls: accounts })
  accounts.forEach((o, i) => {
    ownedAssets[i].forEach(tokenStr => {
      tokenStr = ethers.utils.parseBytes32String(tokenStr)
      const token = assetToAddressMapping[tokenStr]
      if (!token) throw new Error('Missing asset mapping for: ' + tokenStr)
      tokensAndOwners.push([token, o])
    })
  })

  const balances = await sumTokens2({ api, tokensAndOwners: tokensAndOwners })
  await Promise.all(vectorTokens.map(i => addVectorVaultBalances({ api, balances, accounts, token: i })))
  return balances;
}

async function addVectorVaultBalances({ balances, accounts, api, token }) {
  const helper = await api.call({
    abi: getPoolHelperAbi,
    target: VF_MAINSTAKING_CONTRACT,
    params: [token],
  })
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
