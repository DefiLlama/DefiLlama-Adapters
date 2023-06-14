const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { transformBalances } = require('../helper/portedTokens')
const abi = require("./abi.json");
const { createIncrementArray } = require('../helper/utils');
const { sumTokens2, unwrapUniswapV3NFTs } = require('../helper/unwrapLPs');
const { GraphQLClient, gql } = require('graphql-request');


const ichiLegacy = "0x903bEF1736CDdf2A537176cf3C64579C3867A881";
const ichi = "0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6";
const xIchi = "0x70605a6457B0A8fBf1EEE896911895296eAB467E";
const tokenFactory = "0xD0092632B9Ac5A7856664eeC1abb6E3403a6A36a";
const farmContract = "0x275dFE03bc036257Cd0a713EE819Dbd4529739c8";
const ichiLending = "0xaFf95ac1b0A78Bd8E4f1a2933E373c66CC89C0Ce";

const unilps = [
  // SLP
  "0x9cD028B1287803250B1e226F0180EB725428d069",
  // UNI-V2 lP
  "0xd07D430Db20d2D7E0c4C11759256adBCC355B20C"
]
const poolWithTokens = [
  // BANCOR
  ["0x4a2F0Ca5E03B2cF81AebD936328CF2085037b63B", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"]],
  // ONE INCH
  ["0x1dcE26F543E591c27717e25294AEbbF59AD9f3a5", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x111111111117dC0aa78b770fA6A738034120C302"]],
  // BALANCER
  ["0x58378f5F8Ca85144ebD8e1E5e2ad95B02D29d2BB", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", ADDRESSES.ethereum.WETH]]
]

const graphUrl = {
   'ethereum': 'https://api.thegraph.com/subgraphs/name/ichi-org/v1',
   'polygon': 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1'
}

const graphQuery = gql`
query { 
  ichiVaults {
    id
    tokenA
    tokenB
  }
}
`;

async function getVaultsByGraph(chain = 'ethereum') {
  const graphQLClient = new GraphQLClient(graphUrl[chain]);

  const data = await graphQLClient.request(graphQuery);

  const vaults = [];
  data.ichiVaults.forEach( v => vaults.push({address: v.id, tokenA: v.tokenA, tokenB: v.tokenB}));
  
  return vaults;
}

async function vaultBalances(block, chain = 'ethereum', oneTokenList){
  const vaults = await getVaultsByGraph(chain)
  
  const poolsCalls = vaults.map(i => ({ target: i.address }))
  
  const { output: vaultBalances } = await sdk.api.abi.multiCall({
    abi: abi.getTotalAmounts,
    calls: poolsCalls,
    chain, block,
  })

  const balances = {}
  vaultBalances.forEach((data, i) => {
    addBalance(vaults[i].tokenA, data.output.total0)
    addBalance(vaults[i].tokenB, data.output.total1)
  })

  return balances;

  function addBalance(token, balance) {
    if (oneTokenList.includes(token.toLowerCase()))
      return;
    sdk.util.sumSingleBalance(balances, token, balance)
  }
}

const oneFactory = {
  'ethereum': '0xD0092632B9Ac5A7856664eeC1abb6E3403a6A36a',
  'polygon': '0x101eB16BdbA37979a771c86e1CAAfbaDbABfc879'
}

async function oneTokenBalances(block, chain='ethereum') {
  
  // get list of all oneTokens in system
  const { output: oneTokenCount } = await sdk.api.abi.call({
    target: oneFactory[chain],
    abi: abi.oneTokenCount,
    chain, block,
  })

  const oneTokenParams = createIncrementArray(oneTokenCount).map(i => ({ params: i }))
  const { output: oneTokens } = await sdk.api.abi.multiCall({
    target: oneFactory[chain],
    abi: abi.oneTokenAtIndex,
    calls: oneTokenParams,
    chain, block,
  })

  const oneTokenList = oneTokens.map(i => ( i.output.toLowerCase() ))

  // get list of all tokens in the system
  const { output: foreignTokenCount } = await sdk.api.abi.call({
    target: oneFactory[chain],
    abi: abi.foreignTokenCount,
    chain, block,
  })

  const foreignTokenParams = createIncrementArray(foreignTokenCount).map(i => ({ params: i}))
  const { output: foreignTokens } = await sdk.api.abi.multiCall({
    target: oneFactory[chain],
    abi: abi.foreignTokenAtIndex,
    calls: foreignTokenParams,
    chain, block,
  })

  const foreignTokenList = foreignTokens.map(i => (i.output))

  // ICHI is not admited as foreign token to polygon oneToken Factory but it is used to back oneToken treasury 
  if (chain == 'polygon') {
    foreignTokenList.push(ichi)
  }

  // get list of all strategies in the system
  const { output: moduleCount } = await sdk.api.abi.call({
    target: oneFactory[chain],
    abi: abi.moduleCount,
    chain, block,
  })

  const strategyParams = createIncrementArray(moduleCount).map(i => ({ params: i}))
  const { output: moduleAtIndex } = await sdk.api.abi.multiCall({
    target: oneFactory[chain],
    abi: abi.moduleAtIndex,
    calls: strategyParams,
    chain, block,
  })

  const modulesList = moduleAtIndex.map(i => ( {params: i.output }))

  const { output: moduleDetails } = await sdk.api.abi.multiCall({
    target: oneFactory[chain],
    abi: abi.modules,
    calls: modulesList,
    chain, block,
  })
  
  const strategiesList = []
  moduleDetails.forEach((data, i) => {
    if (data.output.moduleType == 2) { //modeuleType 2 are strategies
      strategiesList.push(modulesList[i].params)
    }
  })

  // get list of all owners of oneTokens 
  const ownerCalls =  oneTokens.map(i => ( { target: i.output }))
  const { output: oneTokenOwners } = await sdk.api.abi.multiCall({
    abi: abi.owner,
    calls: ownerCalls,
    chain, block,
  })

  const oneTokenOwnersList = oneTokenOwners.map(i => (i.output))

  // create large list of tokens and owners list; 
  // owners are all onetokens, strategies, and owners of onetokens 
  // tokens are all tokens in the system but will exclude onetokens in the strategies

  const toa = []

  oneTokenList.forEach( oneToken => foreignTokenList.forEach( foreignToken => toa.push([foreignToken, oneToken])))
  strategiesList.forEach( strategy => foreignTokenList.forEach( foreignToken => toa.push([foreignToken, strategy])))
  oneTokenOwnersList.forEach( owner => foreignTokenList.forEach( foreignToken => toa.push([foreignToken, owner])))
    
  const balances = await sumTokens2({ tokensAndOwners: toa, block, chain, blacklistedTokens: oneTokenList })
  
  const uniV3NFTHolders = [...strategiesList, ...oneTokenOwnersList]

  await unwrapUniswapV3NFTs({ balances, owners: uniV3NFTHolders, chain, block })

  return { balances, oneTokenList };
}

async function tvl(timestamp, block) {

  const { balances, oneTokenList } = await oneTokenBalances(block)

  const vBalances = await vaultBalances(block, undefined, oneTokenList)
  
  for(var token in vBalances)
    sdk.util.sumSingleBalance(balances, token, vBalances[token])

  return balances
}

async function polygonTvl(_, _b, { polygon: block }){
  const chain = 'polygon'

  const { balances, oneTokenList } = await oneTokenBalances(block, chain)

  const vBalances = await vaultBalances(block, chain, oneTokenList)
  const vBalancesTransformed = await transformBalances(chain,vBalances)
  for(var token in vBalancesTransformed)
    sdk.util.sumSingleBalance(balances, token, vBalancesTransformed[token])

  return balances;
}

module.exports = {
  methodology: "Tokens deposited to mint oneTokens excluding oneTokens , Vault deposits",
  misrepresentedTokens: true,
  doublecounted: true,
  ethereum: {
    tvl,
    pool2: async (_, block) => {
      const toa = [
        ['0x9cd028b1287803250b1e226f0180eb725428d069', farmContract],
        ['0xd07d430db20d2d7e0c4c11759256adbcc355b20c', farmContract],
      ]
      poolWithTokens.forEach(([o, tokens]) => tokens.forEach(t => toa.push([t, o])))
      return sumTokens2({ tokensAndOwners: toa, block, resolveLP: true, })
    },
    staking: stakings([xIchi, ichiLending] , ichiLegacy)
  },
  polygon: {
    tvl: polygonTvl
  }
} // node test.js projects/ichifarm/index.js