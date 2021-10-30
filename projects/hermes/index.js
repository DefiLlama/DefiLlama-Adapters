const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { GraphQLClient, gql } = require('graphql-request')
const { default: BigNumber } = require("bignumber.js");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { toUSDTBalances } = require("../helper/balances");

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';

const masterchefs = {
  iris: "0x4aA8DeF481d19564596754CD2108086Cf0bDc71B",
  apollo: "0x75409C27EA0E28A486B35Bad6006DD114Ae3559B"
}
const tokens ={
  apollo: "0x577aa684b89578628941d648f1fbd6dde338f059",
  iron: "0xd86b5923f3ad7b585ed81b448170ae026c65ae9a",
  usdc: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  lp_apir:"0x98c2343c581a95bb51b4ce4d76015923d7dd3a23",
  lp_irice:"0x7e2cc09d3d36b3af6edff55b214fd62885234e95",
  lp_usdcice:"0x34832d9ac4127a232c1919d840f7aae0fcb7315b"
}
const lpFarms = {
  lp_apir:"0x98c2343c581a95bb51b4ce4d76015923d7dd3a23",
  lp_apice:"0xe6a2631d6ef2bd7921ce6d51758c0249270a2b63"
}
const vaults = [
  //IRIS VAULTS
  { 
    name: "KAVIAN/WMATIC",
    vault: "0x75fd7fa818f0d970668dca795b7d79508776a5b1",
    lpToken: "0xca2cfc8bf76d9d8eb08e824ee6278f7b885c3b70",
    amm: "quickswap"
  },
  {
    name: "GBNT/WMATIC",
    vault: "0x483a58Fd4B023CAE2789cd1E1e5F6F52f93df2C7",
    lpToken: "0xd883c361d1e8a7e1f77d38e0a6e45d897006b798",
    amm: "polycat"
  },
  //APOLLO VAULTS
  {
    name: "USDC/WETH",
    vault: "0x0f8860515B51bBbB3AEe4603Fe8716454a2Ed24C",
    lpToken: "0x853ee4b2a13f8a742d64c8f088be7ba2131f670d",
    amm: "quickswap"
  },
  {
    name: "USDC/USDT",
    vault: "0xaaF43E30e1Aa6ed2dfED9CCD03AbAF7C34B5B8F6",
    lpToken: "0x2cf7252e74036d1da831d11089d326296e64a728",
    amm: "quickswap"
  },
  {
    name: "ETH/WMATIC",
    vault: "0xC12b54BAEc88CC4F28501f90Bb189Ac7132ee97F",
    lpToken: "0xadbf1854e5883eb8aa7baf50705338739e558e5b",
    amm: "quickswap"
  },
  {
    name: "BTC/ETH",
    vault: "0xf32baBB43226DdF187151Eb392c1e7F8C0F4a2BB",
    lpToken: "0xdc9232e2df177d7a12fdff6ecbab114e2231198d",
    amm: "quickswap"
  },
  {
    name: "DFYN/ROUTE",
    vault: "0x467cb3cE716e0801355BFb3b3F4070108E46051f",
    lpToken: "0xb0dc320ea9eea823a150763abb4a7ba8286cd08b",
    amm: "dfyn"
  },

]

const ignoreAddr = [
  "0x75fd7fa818f0d970668dca795b7d79508776a5b1", //godKAVIANWMATIC
  "0x483a58Fd4B023CAE2789cd1E1e5F6F52f93df2C7", //godGBNTWMATIC
  "0x0f8860515B51bBbB3AEe4603Fe8716454a2Ed24C", //godUSDCWETH
  "0xaaF43E30e1Aa6ed2dfED9CCD03AbAF7C34B5B8F6", //godUSDCUSDT
  "0xC12b54BAEc88CC4F28501f90Bb189Ac7132ee97F", //godETHWMATIC
  "0xf32baBB43226DdF187151Eb392c1e7F8C0F4a2BB", //godBTCETH
  "0x467cb3cE716e0801355BFb3b3F4070108E46051f"  //godDFYNROUTE
  // "0x4d1E50D81C7FaFEBF4FC140c4C6eA7Fd1C2F372b", //DYFNLP
  // "0x996B06F25069Cf9F0B88e639f8E1FB22C6558805", //DFYNLP
  // "0xE6a2631D6Ef2BD7921cE6d51758c0249270A2B63", //APOLLO/ICE
  // "0x98c2343c581a95BB51b4cE4D76015923D7dD3a23"  //APOLLO/IRON
]

const endpoints = { 
  quickswap: "https://api.thegraph.com/subgraphs/name/apyvision/quickswap0921",
  polycat: "https://api.thegraph.com/subgraphs/name/polycatfi/polycat-finance-dex",
  dfyn: "https://api.thegraph.com/subgraphs/name/ss-sonic/dfyn-v5",
  balancer: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2"
}

const query = gql`
  query get_tvl($lpTokenId: String){
    pair(
      id: $lpTokenId
      ){
      totalSupply
      reserveUSD
    }
  }
  `;

const lpReservesAbi = { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }
const lpSuppliesAbi = {"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}
const token0Abi =  {"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}
const token1Abi = {"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}
  
const balanceUSDCString = "polygon:" + tokens.usdc

async function apolloRoute(lpBalance){
  const lptokenA = tokens.lp_apir;
  const lptokenIce = tokens.lp_irice;
  const lptokenU = tokens.lp_usdcice;
  var graphQLClient = new GraphQLClient(endpoints.dfyn);
  const queryDfyn = gql`
  query get_price($lptokenA: String, $lptokenU: String, $lptokenIce: String){
    Apollo: 
    pair(id: "0x98c2343c581a95bb51b4ce4d76015923d7dd3a23"){
      token1Price
    }
    Usdc:
    pair(id:"0x34832d9ac4127a232c1919d840f7aae0fcb7315b"){
      token0Price
    }
    Ice:
    pair(id:"0x7e2cc09d3d36b3af6edff55b214fd62885234e95"){
      token0Price
    }
  }`
  const pair = await graphQLClient.request(queryDfyn, {
    lptokenA, lptokenU, lptokenIce
  });
  const usdcBalance = BigNumber(lpBalance).times(BigNumber(pair.Apollo.token1Price)).times(BigNumber(pair.Ice.token0Price)).times(BigNumber(pair.Usdc.token0Price)).div(1e12);
  return Number(usdcBalance).toFixed(0).toString();
}

  async function unwrapApolloLPs(balances, lpPositions, block, chain='polygon', transformAddress=(addr)=>addr, excludeTokensRaw = [], retry = false) {
    const excludeTokens = excludeTokensRaw.map(addr=>addr.toLowerCase())
    const lpTokenCalls = lpPositions.map(lpPosition=>({
        target: lpPosition.token
    }))
    const lpReserves = sdk.api.abi.multiCall({
        block,
        abi: lpReservesAbi,
        calls: lpTokenCalls,
        chain
    })
    const lpSupplies = sdk.api.abi.multiCall({
        block,
        abi: lpSuppliesAbi,
        calls: lpTokenCalls,
        chain
      })
      const tokens0 = sdk.api.abi.multiCall({
        block,
        abi:token0Abi,
        calls: lpTokenCalls,
        chain
      })
      const tokens1 = sdk.api.abi.multiCall({
        block,
        abi:token1Abi,
        calls: lpTokenCalls,
        chain
      })
      if(retry){
        await Promise.all([
            [lpReserves, lpReservesAbi],
            [lpSupplies, lpSuppliesAbi],
            [tokens0, token0Abi],
            [tokens1, token1Abi]
        ].map(async call=>{
            await requery(await call[0], chain, block, call[1])
        }))
      }
      await Promise.all(lpPositions.map(async lpPosition => {
        try{
            const lpToken = lpPosition.token
            const token0 = (await tokens0).output.find(call=>call.input.target === lpToken).output.toLowerCase()
            const token1 = (await tokens1).output.find(call=>call.input.target === lpToken).output.toLowerCase()
            if(excludeTokens.includes(token0) || excludeTokens.includes(token1)){
                return
            }
            const supply = (await lpSupplies).output.find(call=>call.input.target === lpToken).output
            const {_reserve0, _reserve1} = (await lpReserves).output.find(call=>call.input.target === lpToken).output
            const token0Balance =BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply))
            // let token0Balance =Number(lpPosition.balance * _reserve0 / supply)
            const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply))
            let tokenUsdcBalance = 0;
            // let token1Balance = Number(lpPosition.balance * _reserve1 / supply)
            if(token0 == tokens.apollo)
              tokenUsdcBalance = (await apolloRoute(token0Balance))
            else if(token1 == tokens.apollo)
              tokenUsdcBalance = (await apolloRoute(token1Balance))
            
            sdk.util.sumSingleBalance(balances, balanceUSDCString, tokenUsdcBalance)

            // 
          
          } catch(e){
              console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
              throw e
          }
      }))
}
async function getBalancerTVL(chainBlocks){
  const block = chainBlocks.polygon;
  const chain = "polygon";
  const lpTokenId = "0x7320d680ca9bce8048a286f00a79a2c9f8dcd7b3";
  const balancerAddr = "0x7320d680ca9bce8048a286f00a79a2c9f8dcd7b3000100000000000000000044"
  var graphQLClient = new GraphQLClient(endpoints.balancer);
  const queryBal = gql`
    query get_price($balancerAddr: String){
      pool(
        id: $balancerAddr
        ){
        totalLiquidity
        totalShares
      }
    }
    `;
  const response = await graphQLClient.request(queryBal, {
    balancerAddr
  });
  const price = BigNumber(response.pool.totalLiquidity).div(response.pool.totalShares);
  const balanceCall = sdk.api.abi.call({
    target: lpTokenId,
    abi: abi.balanceof,
    block: block,
    params: masterchefs.apollo,
    chain: chain
  });
  const lpBalance = (await balanceCall).output;
  const usdTvl = BigNumber(lpBalance).times(price).div(1e18);

  return toUSDTBalances(usdTvl);
}

async function getVaultTVL(vaultInfo, chainBlocks){
  const block = chainBlocks.polygon;
  const chain = "polygon";
  const lpTokenId = vaultInfo.lpToken;
  var graphQLClient = new GraphQLClient(endpoints[vaultInfo.amm]);
  
  //First, we'll get the totalSupply and the reserves in USD in the AMM 4 this lpToken
  const pair = await graphQLClient.request(query, {
    lpTokenId
  });

  //Then, we get the balance in our vault
  const balanceCall = sdk.api.abi.call({
    target: vaultInfo.vault,
    abi: abi.balance,
    block: block,
    chain: chain
  })
  const lpBalance = (await balanceCall).output;
  
  //Last, the tvl in USD in our vault
  const usdTvl =  BigNumber(lpBalance).times(pair.pair.reserveUSD).div(pair.pair.totalSupply).div(1e18);
  
  return toUSDTBalances(usdTvl)["0xdac17f958d2ee523a2206206994597c13d831ec7"];
}

const tvlVaults = async (timestamp, ethBlock, chainBlocks) => {
  let balances = {};
  for (let i = 0; i < vaults.length; i++) {
    sdk.util.sumSingleBalance(balances, usdtAddress, await getVaultTVL(vaults[i], chainBlocks));
  }
  
  return balances;
};

const tvlBalancer = async (timestamp, ethBlock, chainBlocks) => {
  return await getBalancerTVL(chainBlocks);
}

const masterchefTVL = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = addr => `polygon:${addr}`;

  await addFundsInMasterChef(balances, masterchefs.apollo, chainBlocks.polygon, "polygon", transformAddress, undefined, ignoreAddr)


  //APOLLO LPS BALANCE
  const balanceCall = sdk.api.abi.call({
    target: tokens.apollo,
    abi: abi.balanceof,
    params: masterchefs.apollo,
    block: chainBlocks.polygon,
    chain: "polygon"
  })
  const lpBalance = (await balanceCall).output;
  const balanceApolloIceLp = sdk.api.abi.call({
    target: tokens.apollo,
    abi: abi.balanceof,
    params: lpFarms.lp_apice,
    block: chainBlocks.polygon,
    chain: "polygon"
  })
  const balanceApolloIronLp = sdk.api.abi.call({
    target: tokens.apollo,
    abi: abi.balanceof,
    params: lpFarms.lp_apir,
    block: chainBlocks.polygon,
    chain: "polygon"
  })
  const lpPosition = [
    {
      balance: (await balanceApolloIceLp).output,
      token: lpFarms.lp_apice
    },
    {
      balance: (await balanceApolloIronLp).output,
      token: lpFarms.lp_apir
    }
  ]
  const apolloToUsdc = (await apolloRoute(lpBalance));
  
  sdk.util.sumSingleBalance(balances, balanceUSDCString, apolloToUsdc);
  unwrapApolloLPs(
    balances,
    lpPosition,
    chainBlocks.polygon,
    "polygon",
    transformAddress
  )
  
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Hermes TVL is calculated from our vaults, which are not native tokens. Pool 2 is based on the TVL of native tokens hosted in our masterchef.",
  pool2: {
    masterchefTVL,
    tvlBalancer
  },
  vault: {
    tvlVaults,
  },
  tvl: sdk.util.sumChainTvls([
    masterchefTVL,
    tvlBalancer,
    tvlVaults
  ])
};
