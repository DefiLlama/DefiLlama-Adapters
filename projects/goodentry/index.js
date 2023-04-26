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

// Aave helper doesnt recognize tokenized Uniswap positions, need to manually


function geTvl() {
  const chain = "arbitrum";
  return async (timestamp, ethBlock, { [chain]: block }) => {
    const balances = {}
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
            }
            catch(e) {}
            try {
              // if it's a ticker, can call underlying
              const underlying = (await sdk.api.abi.call({target: atn, abi: getUnderlyingAbi, block, chain, params: balance})).output;
              const token0 = (await sdk.api.abi.call({target: atn, abi: token0Abi, block, chain})).output.token;
              const token1 = (await sdk.api.abi.call({target: atn, abi: token1Abi, block, chain})).output.token;

              res[chain+":"+token0] = parseInt(underlying.token0Amount);
              res[chain+":"+token1] = parseInt(underlying.token1Amount);
            }
            catch(e){
              // in case of error, return the base asset
              res[chain+":"+atn] = parseInt(balance);
            }
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
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  arbitrum: {
    tvl: geTvl(),
  }
};
