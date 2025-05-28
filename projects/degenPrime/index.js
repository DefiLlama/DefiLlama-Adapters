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
  "KAITO": "0x98d0baa52b2D063E780DE12F615f963Fe8537553",
  "ezETH": "0x2416092f143378750bb29b79eD961ab195CcEea5",
  "weETH": "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A",
  "EUROC": "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
  "VVV": "0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf",
  "COOKIE": "0xc0041ef357b183448b235a8ea73ce4e4ec8c265f",
  "BNKR": "0x22af33fe49fd1fa80c7149773dde5890d3c76f3b",
  "ZORA": "0x1111111111166b7fe7bd91427724b487980afc69",
  "DINO": "0x85E90a5430AF45776548ADB82eE4cD9E33B08077",
  "DRB": "0x3ec2156d4c0a9cbdab4a016633b7bcf6a8d68ea2",
  "CLANKER": "0x1bc0c42215582d5a085795f4badbac3ff36d1bcb",
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