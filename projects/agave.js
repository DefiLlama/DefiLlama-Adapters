const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
const { staking } = require("./helper/staking.js");

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
async function getV2Reserves_graphql(block, addressesProviderRegistry, chain, v2Atokens, v2ReserveTokens, addressSymbolMapping) {
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
function aaveChainTvl_graphql(chain, addressesProviderRegistry, transformAddress){
  return async (timestamp, ethBlock, chainBlocks)=>{
    const balances = {}
    let v2Atokens = [];
    let v2ReserveTokens = [];
    let addressSymbolMapping = {};
    [v2Atokens, v2ReserveTokens, addressSymbolMapping] = await getV2Reserves_graphql(chainBlocks[chain], addressesProviderRegistry, chain, v2Atokens, v2ReserveTokens, addressSymbolMapping)
    const v2Tvl = await getV2Tvl(chainBlocks[chain], chain, v2Atokens, v2ReserveTokens, addressSymbolMapping);
    v2Tvl.map(data => {
      sdk.util.sumSingleBalance(balances, transformAddress?transformAddress(data.underlying):`${chain}:${data.underlying}`, data.balance);
    })
    return balances
  }
}

// aaveChainTvl returns a function which uses our agave getV2Reserves and then aave.js default getV2Tvl 
const xdai_graphql = aaveChainTvl_graphql("xdai", "not-needed-but-left-for-compatibility-with-helper/aave.js");


// Staking TVLs
const agaveTokenAddress = '0x3a97704a1b25F08aa230ae53B352e2e72ef52843'
const agaveStakingContract = '0x610525b415c1BFAeAB1a3fc3d85D87b92f048221'

// getAddressesProvidersList executed on https://blockscout.com/xdai/mainnet/address/0xa5E80AEAa020Ae41b1cBEe75dE7826297F7D803E/read-contract returns [0x24604cc6a929e10878534f9e7bf8083d98aba0a2, 0xa91b9095efa6c0568467562032202108e49c9ef8]
// however, cannot find the correct parameter to getAddress(param) on these two contracts
// Can instead use directly the ProtocolDataProvider 0xa874f66342a04c24b213BF0715dFf18818D24014
const abi = require('./helper/abis/aave.json')
const addressesProviderRegistryXDAI = "0xa5E80AEAa020Ae41b1cBEe75dE7826297F7D803E" 
// const {getV2Reserves} = require('./helper/aave')

async function xdai_registry(timestamp, ethBlock, chainBlocks) {
  // Had to explode getV2Reserves because cannot find the correct parameter to getAddress(param) on addressProvider
  // V2 TVLs
  let balances = {}
  let v2Atokens = []
  let v2ReserveTokens = []
  let addressSymbolMapping = {}

  const chain = 'xdai'
  const block = chainBlocks[chain]
  validProtocolDataHelpers = '0xa874f66342a04c24b213BF0715dFf18818D24014'
  
  const aTokenMarketData = (
    await sdk.api.abi.multiCall({
      calls: [{target: validProtocolDataHelpers}],
      abi: abi["getAllATokens"],
      block,
      chain
    })
  ).output;

  let aTokenAddresses = [];
  aTokenMarketData.map((aTokensData) => {
      aTokenAddresses = [
        ...aTokenAddresses,
        ...aTokensData.output.map((aToken) => aToken[1]),
      ];
  });

  const underlyingAddressesData = (
    await sdk.api.abi.multiCall({
      calls: aTokenAddresses.map((aToken) => ({
        target: aToken,
      })),
      abi: abi["getUnderlying"],
      block,
      chain
    })
  ).output;

  let reserveAddresses = [];
  underlyingAddressesData.map((reserveData) => {
    reserveAddresses.push(reserveData.output)
  });

  v2Atokens = aTokenAddresses
  v2ReserveTokens = reserveAddresses;

  // Fetch associated token info
  const symbolsOfReserves = (
    await sdk.api.abi.multiCall({
      calls: v2ReserveTokens.map((underlying) => ({
        target: underlying,
      })),
      abi: "erc20:symbol",
      block,
      chain
    })
  ).output;

  const decimalsOfReserves = (
    await sdk.api.abi.multiCall({
      calls: v2ReserveTokens.map((underlying) => ({
        target: underlying,
      })),
      abi: "erc20:decimals",
      block,
      chain
    })
  ).output

  symbolsOfReserves.map((r) => {
    let symbol = r.output
    addressSymbolMapping[r.input.target] = { symbol };
  });

  decimalsOfReserves.map((r) => {
    const address = r.input.target;
    const existingAddress = addressSymbolMapping[address];
    addressSymbolMapping[address] = {
      ...existingAddress,
      decimals: r.output,
    };
  });
  // {v2Atokens, v2ReserveTokens, addressSymbolMapping} = await getV2Reserves(chainBlocks['xdai'], addressesProviderRegistryXDAI, 'xdai', v2Atokens, v2ReserveTokens, addressSymbolMapping_, protocolDataHelperParam="0x0000000000000000000000000000000000000000000000000000000000001 ")

  const v2Tvl = await getV2Tvl(chainBlocks['xdai'], 'xdai', v2Atokens, v2ReserveTokens, addressSymbolMapping)
  v2Tvl.map(data => {
    if (balances['xdai:' + data.underlying]) {
      balances['xdai:' + data.underlying] = BigNumber(balances[data.underlying])
        .plus(data.balance)
        .toFixed()
    } else {
      balances['xdai:' + data.underlying] = data.balance
    }
  })
  return balances;
}


module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  xdai:{
    tvl: xdai_registry,
    staking: staking(agaveStakingContract, agaveTokenAddress, chain="xdai")
  }
};


/*
addressesProviderRegistry = '0xa5E80AEAa020Ae41b1cBEe75dE7826297F7D803E'
const addressesProviders = (
  await sdk.api.abi.call({
    target: addressesProviderRegistry,
    abi: abi["getAddressesProvidersList"],
    block,
    chain
  })
).output;
// returns ['0x24604Cc6a929E10878534F9E7bf8083D98ABA0A2', '0xa91b9095efa6c0568467562032202108e49c9ef8']

let protocolDataHelpers = (
  await sdk.api.abi.multiCall({
    calls:[{
      target: "0x24604Cc6a929E10878534F9E7bf8083D98ABA0A2",
      params: "0x0000000000000000000000000000000000000000000000000000000000001",
    }],
    abi: abi['getAddress'],
    block: chainBlocks['xdai'],
    chain: 'xdai'
  })
)
protocolDataHelpers = protocolDataHelpers.output;
console.log('protocolDataHelpers', protocolDataHelpers)
// Or parameter 0x0000000000000000000000000000000000000000000000000000000000000001 not working either
*/