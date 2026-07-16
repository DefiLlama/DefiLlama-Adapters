const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')

const getAllOwnedAssetsAbi = "function getAllOwnedAssets() view returns (bytes32[] result)"
const getLoansAbi = "function getLoans(uint256 _from, uint256 _count) view returns (address[] _loans)"
const getPrimeAccountsLengthAbi = 'uint256:getLoansLength';

// Aerodrome position ABIs
const getOwnedStakedAerodromeTokenIdsAbi = "function getOwnedStakedAerodromeTokenIds() public view returns (uint256[] memory)"
const getPositionCompositionAbi = "function getPositionCompositionSimplified(uint256 positionId) public view returns (tuple(address token0, address token1, uint256 token0Amount, uint256 token1Amount) positionComposition)"

const assetToAddressMappingBase = {
  "cbBTC": ADDRESSES.base.cbBTC,
  "LBTC": ADDRESSES.etlk.LBTC,
  "cbLTC": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "cbDOGE": "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE",
  "cbXRP": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "SPX": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "USDC": ADDRESSES.base.USDC,
  "USDT": ADDRESSES.base.USDT,
  "USD+": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "AERO": "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE",
  "ETH": ADDRESSES.optimism.WETH_1,
  "GIZA": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "BRETT": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "SKI": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "DEGEN": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "TOSHI": "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE",
  "KEYCAT": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "BASEDPEPE": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "VIRTUAL": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "MOG": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "AIXBT": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "KAITO": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "ezETH": ADDRESSES.optimism.ezETH,
  "weETH": ADDRESSES.base.weETH,
  "EUROC": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "VVV": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "COOKIE": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "BNKR": "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE",
  "ZORA": "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE",
  "DINO": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
  "DRB": "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE",
  "CLANKER": "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
}

// Base
const USDC_POOL_TUP_CONTRACT = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1';
const AERO_POOL_TUP_CONTRACT = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1';
const BTC_POOL_TUP_CONTRACT = '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE';
const ETH_POOL_TUP_CONTRACT = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1';
const BRETT_POOL_TUP_CONTRACT = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1';
const KAITO_POOL_TUP_CONTRACT = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1';
const DOGE_POOL_TUP_CONTRACT = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1';
const XRP_POOL_TUP_CONTRACT = '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE';

const SMART_LOANS_FACTORY_TUP_BASE = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1';

/**
 * Add Aerodrome LP positions to TVL calculation
 * @param {Object} api - api object from sdk
 * @param {Array} accounts - array of account addresses
 */
async function addAerodromePositions({ api, accounts }) {
  // Get all owned Aerodrome token IDs for each account
  const ownedTokenIds = await api.multiCall({
    abi: getOwnedStakedAerodromeTokenIdsAbi,
    calls: accounts
  });

  const positionCalls = [];

  // Prepare calls for getPositionCompositionSimplified for each token ID
  ownedTokenIds.forEach((tokenIds, accountIndex) => {
    const account = accounts[accountIndex];
    tokenIds.forEach(tokenId => {
      positionCalls.push({
        target: account,
        params: [tokenId]
      });
    });
  });

  // Get position compositions
  const positionCompositions = await api.multiCall({
    abi: getPositionCompositionAbi,
    calls: positionCalls
  });

  // Add token amounts to balances
  positionCompositions.forEach(({ token0, token1, token0Amount, token1Amount }) => {
    api.add(token0, token0Amount);
    api.add(token1, token1Amount);
  });

  sdk.log(`Added ${positionCalls.length} Aerodrome positions to TVL`);
}

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
    [assetToAddressMappingBase.cbBTC, BTC_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.ETH, ETH_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.KAITO, KAITO_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.cbDOGE, DOGE_POOL_TUP_CONTRACT],
    [assetToAddressMappingBase.cbXRP, XRP_POOL_TUP_CONTRACT]
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

  // Add Aerodrome positions to TVL calculation
  await addAerodromePositions({ api, accounts });

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
  methodology: 'Counts TVL of DegenPrime\'s lending pools and individual PrimeAccount contracts including Aerodrome LP positions',
  base: {
    tvl: tvlBase,
  },
}
