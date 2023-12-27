const { aaveChainTvl,getData } = require("../helper/aave");
const abi = require('../helper/abis/aave.json');
const sdk = require('@defillama/sdk');

const addressesProviderRegistry = '0x01b76559D512Fa28aCc03630E8954405BcBB1E02';
const balanceOfAbi = "function balanceOf(address account) view returns (uint256)";
const getLpAbi = "function getLendingPool() view returns (address)";
const getReserveDataAbi = "function getReserveData(address asset) view returns (uint256 reserveConfigurationMap, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)";
const getUnderlyingAbi = "function getTokenAmounts(uint amount) external view returns (uint token0Amount, uint token1Amount)";
const token0Abi = "function TOKEN0() view returns (address token, uint8 decimals)";
const token1Abi = "function TOKEN1() view returns (address token, uint8 decimals)";
// v2 getReserves ABI
const vaultReservesAbi = "function getReserves() view returns (uint baseAmount, uint quoteAmount, uint valueX8)";


// V1 supported tokens
const v1tokens = [
  "0x912CE59144191C1204E64559FE8253a0e49E6548", 
  "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", 
  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 
  "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", 
  "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"
]


// Existing v2 vaults: { vaultAddress: {name, base, quote} }
const v2vaults = [
  {
    address: "0x1ba92C53BFe8FD1D81d84B8968422192B73F4475", 
    name: "ARB-USDC.e UNIv3", base: "0x912CE59144191C1204E64559FE8253a0e49E6548", quote: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
  },
  {
    address: "0xd5fE1A54fA642400ef559d866247cCE66049141B",
    name: "ARB-USDC.e Camelot", base: "0x912CE59144191C1204E64559FE8253a0e49E6548", quote: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
  },
  {
    address: "0x419ae989a629Cc71834BDf6E3e8E33c9c3ED3Bb4", 
    name: "ARB-USDC Camelot", base: "0x912CE59144191C1204E64559FE8253a0e49E6548", quote: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
  },
  {
    address: "0x36003A975bFC56f650590C26B1479ba423217931", 
    name: "ETH-USDC.e Camelot", base: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", quote: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
  },
  {
    address: "0xd666156C473Cc9539CAaCc112B3A3590a895C861", 
    name: "ETH-USDC Camelot", base: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", quote: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
  },
  {
    address: "0x21EB68Cc5a5d51b48e0DE743f321151523b7A15D", 
    name: "GMX-USDC Camelot", base: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", quote: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
  },
  {
    address: "0x5f6aB9b043C43FaB8D2A51EA85b70495B5EeFD15",
    name: "WBTC-USDC Camelot", base: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", quote: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
  },
]



const getTvlV2 = async (chain, block) => {
  const balances = {}
  // GoodEntry v2: call getReserves() on each vault
  const balsv2 = (await Promise.all(
    v2vaults.map( async (vault) => {
      var res = {}
      try {
        let reserves = (await sdk.api.abi.call({target: vault.address, abi: vaultReservesAbi, block, chain})).output;
        res[chain+":"+vault.base] = parseInt(reserves.baseAmount);
        res[chain+":"+vault.quote] = parseInt(reserves.quoteAmount);
      } catch(e) {}
      return res
    })
  )).flat(2)

  //aggregate tokens balances
  for (let k of balsv2){
    for( const [key, bal] of Object.entries(k)){
      balances[key] = balances.hasOwnProperty(key) ? bal + balances[key] : bal
    }
  }

  return balances
}




function geTvl() {
  const chain = "arbitrum";
  return async (timestamp, ethBlock, { [chain]: block }) => {
    const balances = await getTvlV2(chain, block)

    // GoodEntry v1: loop on lending pools and tickers to get underlying assets
    const addressesProviders = (
      await sdk.api.abi.call({
        target: addressesProviderRegistry,
        abi: abi["getAddressesProvidersList"],
        block,
        chain
      })
    ).output;
    const validAddressesProviders = addressesProviders.filter((ap) => ap != "0x0000000000000000000000000000000000000000")

    const lendingPools = (
      await sdk.api.abi.multiCall({
        calls: validAddressesProviders.map((provider) => ({
          target: provider,
        })),
        abi: getLpAbi,
        block,
        chain
      })
    ).output;

    const aTokens = (
      await sdk.api.abi.multiCall({
        calls: lendingPools.map((lp) => ({
          target: lp.output,
        })),
        abi: abi["getReservesList"],
        block,
        chain
      })
    ).output

    // merge 
    const ge = {}
    for (let k of lendingPools) ge[k.output] = {ap: k.input.target}
    for (let k of aTokens) ge[k.input.target].aTokens = k.output
    
    const bals = (await Promise.all(
      Object.keys(ge).map( async (pool) => {
        const atns = ge[pool].aTokens;
        const atnsRes = await Promise.all(atns.map(async (atn) => {
            var aTokenAddress;
            var balance = 0;
            var res = {}
            try {
              aTokenAddress = (await sdk.api.abi.call({target: pool, abi: getReserveDataAbi, block, chain, params: atn})).output.aTokenAddress;
              balance = (await sdk.api.abi.call({target: atn, abi: balanceOfAbi, block, chain, params: aTokenAddress})).output;

              // if this is a support ERC20 (and not a tokenised range)
              if (v1tokens.includes(atn)){
                res[chain+":"+atn] = parseInt(balance);
              }
              else {
                // ignore low balance assets to save calls, since anyway tickers are initialized with value around ~$1/1e18
                if (balance < 10e18) return res;
                
                // if it's a ticker, can call underlying
                const underlying = (await sdk.api.abi.call({target: atn, abi: getUnderlyingAbi, block, chain, params: balance})).output;
                const token0 = (await sdk.api.abi.call({target: atn, abi: token0Abi, block, chain})).output.token;
                const token1 = (await sdk.api.abi.call({target: atn, abi: token1Abi, block, chain})).output.token;

                res[chain+":"+token0] = parseInt(underlying.token0Amount);
                res[chain+":"+token1] = parseInt(underlying.token1Amount);
              }
            }
            catch(e){}
            return res;
          }).flat(2)
        )
        return atnsRes;
      })
    )).flat(2)

    //aggregate tokens balances
    for (let k of bals){
      for( const [key, bal] of Object.entries(k)){
        balances[key] = balances.hasOwnProperty(key) ? bal + balances[key] : bal
      }
    }
    return balances
  }
}


module.exports = {
  methodology:
    "For GoodEntry v1, counts the tokens locked in the Aave lending pool fork. For v2, calls a dedicated getReserves() function on the vault.",
  hallmarks: [
    [1701376109, "V2 Launch"]
  ],
  arbitrum: {
    tvl: geTvl(),
  }
};
