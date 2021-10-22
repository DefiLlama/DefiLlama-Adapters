const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");

// Retrieve aTokens Deposited on AGAVE (v2 aave tokens) and not borrowed against
const graphUrl = 'https://api.thegraph.com/subgraphs/name/agave-dao/agave-xdai'
const graphQuery = gql`
query GET_AGAVE {
  atokens {
    id 
    underlyingAssetAddress 
    underlyingAssetDecimals 
  }
  reserves {
    id
    symbol
    decimals
    name
    underlyingAsset
    totalDeposits
    totalATokenSupply
    totalLiquidity
  }
}
`;

// Retrieves aTokens left to borrow (and does not account for atokens already borrowed to avoid cycled lending). Otherwise, could have a look at the aTokens erc20:totalSupply
async function getV2Reserves(block, addressesProviderRegistry, chain, v2Atokens, v2ReserveTokens, addressSymbolMapping) {
  if (v2Atokens.length !== 0 && v2ReserveTokens.length !== 0) return

  // Retrieve aTokens and reserves from graphql API endpoint
  const { atokens, reserves } = await request(
    graphUrl,
    graphQuery
  );

  // Parse aTokens, underlying reserveTokens, symbols and decimals
  // v2ReserveTokens = atokens.map(atoken => atoken.underlyingAssetAddress);
  // v2Atokens = atokens.map(atoken => atoken.id)
  v2ReserveTokens = []
  v2Atokens = atokens.map(atoken => {
    const underlyingAssetAddress = atoken.underlyingAssetAddress
    v2ReserveTokens.push(underlyingAssetAddress)
    const reserve = reserves.find(r => r.underlyingAsset === underlyingAssetAddress)

    addressSymbolMapping[underlyingAssetAddress] = {
      symbol: reserve.symbol,
      decimals: reserve.decimals
    }
    return atoken.id
  })

  return [v2Atokens, v2ReserveTokens, addressSymbolMapping]
}


// getV2Tvl and aaveChainTvl are exactly identical to ./helper/aave.js, but aaveChainTvl is here needed since we are using a custom agave getV2Reserves 
const {getV2Tvl} = require('./helper/aave.js'); 
function aaveChainTvl(chain, addressesProviderRegistry, transformAddress){
  return async (timestamp, ethBlock, chainBlocks)=>{
    const balances = {}
    let v2Atokens = [];
    let v2ReserveTokens = [];
    let addressSymbolMapping = {};
    [v2Atokens, v2ReserveTokens, addressSymbolMapping] = await getV2Reserves(chainBlocks[chain], addressesProviderRegistry, chain, v2Atokens, v2ReserveTokens, addressSymbolMapping)
    const v2Tvl = await getV2Tvl(chainBlocks[chain], chain, v2Atokens, v2ReserveTokens, addressSymbolMapping);
    v2Tvl.map(data => {
      sdk.util.sumSingleBalance(balances, transformAddress?transformAddress(data.underlying):`${chain}:${data.underlying}`, data.balance);
    })
    return balances
  }
}

// aaveChainTvl returns a function which uses our agave getV2Reserves and then aave.js default getV2Tvl 
const xdai = aaveChainTvl("xdai", "not-needed-but-left-for-compatibility-with-helper/aave.js");


// Staking TVLs
const agaveTokenAddress = '0x3a97704a1b25F08aa230ae53B352e2e72ef52843'
const agaveStakingContract = '0x610525b415c1BFAeAB1a3fc3d85D87b92f048221'
async function staking(timestamp, block, chainBlocks){
  const agveHeldInStkAgve = (await sdk.api.abi.call({
    target: agaveTokenAddress,
    params: agaveStakingContract,
    abi: "erc20:balanceOf",
    block: chainBlocks['xdai'],
    chain: 'xdai'
  })
  ).output;
  return {
    ['xdai:' + agaveTokenAddress]: BigNumber(stakedAgaveAmount).toFixed()
  };
}


module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  staking:{
    tvl: staking
  },
  tvl: xdai
};
