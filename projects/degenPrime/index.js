const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')

const getAllOwnedAssetsAbi = "function getAllOwnedAssets() view returns (bytes32[] result)"
const getLoansAbi = "function getLoans(uint256 _from, uint256 _count) view returns (address[] _loans)"
const getPrimeAccountsLengthAbi = 'uint256:getLoansLength';



const assetToAddressMappingBase = {
  "cbBTC": ADDRESSES.base.cbBTC,
  "USDC": ADDRESSES.base.USDC,
  "AERO": "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
  "ETH": ADDRESSES.optimism.WETH_1,
  "BRETT": "0x532f27101965dd16442E59d40670FaF5eBB142E4",
  "BTC": ADDRESSES.ethereum.cbBTC,
  "SKI": "0x768BE13e1680b5ebE0024C42c896E3dB59ec0149",
  "DEGEN": "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
  "TOSHI": "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4",
  "KEYCAT": "0x9a26F5433671751C3276a065f57e5a02D2817973",
  "BASEDPEPE": "0x52b492a33E447Cdb854c7FC19F1e57E8BfA1777D",
  "VIRTUAL": "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
  "MOG": "0x2Da56AcB9Ea78330f947bD57C54119Debda7AF71",
  "AIXBT": "0x4F9Fd6Be4a90f2620860d680c0d4d5Fb53d1A825",
  "KAITO": "0x98d0baa52b2D063E780DE12F615f963Fe8537553"
}  

// Base
const USDC_POOL_TUP_CONTRACT = '0x2Fc7641F6A569d0e678C473B95C2Fc56A88aDF75';
const AERO_POOL_TUP_CONTRACT = '0x4524D39Ca5b32527E7AF6c288Ad3E2871B9f343B';
const BTC_POOL_TUP_CONTRACT = '0xCA8C954073054551B99EDee4e1F20c3d08778329';
const ETH_POOL_TUP_CONTRACT = '0x81b0b59C7967479EC5Ce55cF6588bf314C3E4852';
const BRETT_POOL_TUP_CONTRACT = '0x6c307F792FfDA3f63D467416C9AEdfeE2DD27ECF';
const KAITO_POOL_TUP_CONTRACT = '0x293E41F1405Dde427B41c0074dee0aC55D064825';

const SMART_LOANS_FACTORY_TUP_BASE = '0x5A6a0e2702cF4603a098C3Df01f3F0DF56115456';

  /**
   * TVL for Base
   * @param {Object} api - api object from sdk
   * @returns {Promise<Object>} - TVL object
   */
async function tvlBase(api) {
  const tokensAndOwners = [
    [assetToAddressMappingBase.USDC, USDC_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.AERO, AERO_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.BRETT, BRETT_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.BTC, BTC_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.ETH, ETH_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.KAITO, KAITO_POOL_TUP_CONTRACT],
  ]

  let accounts = [];
  const numberOfAccounts = await api.call({ abi: getPrimeAccountsLengthAbi, target: SMART_LOANS_FACTORY_TUP_BASE, });
  const batchSize = 500; 
  let batchIndex = 0;
  while (batchIndex * batchSize < numberOfAccounts) {
    let batchPrimeAccounts = await api.call({
      abi: getLoansAbi,
      target: SMART_LOANS_FACTORY_TUP_BASE,
      params: [batchIndex * batchSize, batchSize]
    })
    accounts = accounts.concat(batchPrimeAccounts);
    batchIndex++;
  }

  sdk.log(accounts.length)


  const ownedAssets = await api.multiCall({ abi: getAllOwnedAssetsAbi, calls: accounts })
  accounts.forEach((o, i) => {
    ownedAssets[i].forEach(tokenStr => {
      tokenStr = ethers.decodeBytes32String(tokenStr)
      const token = assetToAddressMappingBase[tokenStr]
      if (!token) {
        sdk.log('Missing asset mapping for: ' + tokenStr)
        return;
      }
      if (!token) throw new Error('Missing asset mapping for: ' + tokenStr)
      tokensAndOwners.push([token, o])
    })
  })

  return sumTokens2({ api, tokensAndOwners: tokensAndOwners })
}


module.exports = {
  methodology: 'Counts TVL of DegenPrime\'s lending pools and individual PrimeAccount contracts\'',
  base: {
    tvl: tvlBase,
  },
}