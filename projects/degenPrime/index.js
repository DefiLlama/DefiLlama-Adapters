const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk');

const getAllOwnedAssetsAbi = "function getAllOwnedAssets() view returns (bytes32[] result)"
const getLoansAbi = "function getLoans(uint256 _from, uint256 _count) view returns (address[] _loans)"
const getPrimeAccountsLengthAbi = 'uint256:getLoansLength';



const assetToAddressMappingBase = require('./mappings/assetToAddressMappingBase.json')

// Base
const USDC_POOL_TUP_CONTRACT = '0x2Fc7641F6A569d0e678C473B95C2Fc56A88aDF75';
const AERO_POOL_TUP_CONTRACT = '0x4524D39Ca5b32527E7AF6c288Ad3E2871B9f343B';
const BTC_POOL_TUP_CONTRACT = '0xCA8C954073054551B99EDee4e1F20c3d08778329';
const ETH_POOL_TUP_CONTRACT = '0x81b0b59C7967479EC5Ce55cF6588bf314C3E4852';
const BRETT_POOL_TUP_CONTRACT = '0x6c307F792FfDA3f63D467416C9AEdfeE2DD27ECF';

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
  ]

  let accounts = [];
  const numberOfAccounts = await api.call({ abi: getPrimeAccountsLengthAbi, target: SMART_LOANS_FACTORY_TUP_BASE, });
  const batchSize = 10; //500 to 10, assuming smaller number of accounts
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

  // await addTraderJoeLPs({ api, accounts })
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

  const balances = await sumTokens2({ api, tokensAndOwners: tokensAndOwners })


  return balances;
}


module.exports = {
  methodology: 'Counts TVL of DeltaPrime\'s lending pools and individual PrimeAccount contracts\'',
  base: {
    tvl: tvlBase,
  },
}