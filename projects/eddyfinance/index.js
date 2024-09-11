const { getUniTVL } = require('../helper/unknownTokens')

/**
 * Update: Add liquidity for UniV2 and StableSwap on ZetaChain
 */

const FOUR_ASSET_POOL_CONTRACT_ADDRESS = "0x448028804461e8e5a8877c228F3adFd58c3Da6B6";
const TWO_ASSET_POOL_ACCUMULATED_FINANCE = "0x01a9cd602c6c3f05ea9a3a55184c2181bd43e4b8";
const TWO_ASSET_POOL_ZEARN = "0xee1629de70afaf3ae3592a9d6d859949750aa697";
const USDC_BSC = "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0";
const USDT_BSC = "0x91d4F0D54090Df2D81e834c3c8CE71C6c865e79F";
const USDC_ETH = "0x0cbe0dF132a6c6B4a2974Fa1b7Fb953CF0Cc798a";
const USDT_ETH = "0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7";
const ZETA_GAS_TOKEN = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf"; // WZETA used instead of Zeta
const STZETA_ACC_FINANCE = "0xcba2aeEc821b0B119857a9aB39E09b034249681A";
const STZETA_ZEARN = "0x45334a5B0a01cE6C260f2B570EC941C680EA62c0";

const stableSwapBalancesAbi = 'function balances(uint256 arg0) view returns (uint256)';
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)';

async function stableSwapTvl(api) {
    // Four asset Pool
    // USDC.BSC
    const poolLiqUSDCBSC = await api.call({ target: FOUR_ASSET_POOL_CONTRACT_ADDRESS, abi: stableSwapBalancesAbi, params: 0 });

    // USDC.ETH
    const poolLiqUSDCETH = await api.call({ target: FOUR_ASSET_POOL_CONTRACT_ADDRESS, abi: stableSwapBalancesAbi, params: 1 });

    // USDT.ETH
    const poolLiqUSDTETH = await api.call({ target: FOUR_ASSET_POOL_CONTRACT_ADDRESS, abi: stableSwapBalancesAbi, params: 2 });

    // USDT.BSC
    const poolLiqUSDTBSC = await api.call({ target: FOUR_ASSET_POOL_CONTRACT_ADDRESS, abi: stableSwapBalancesAbi, params: 3 });

    console.log(poolLiqUSDCBSC, poolLiqUSDTBSC, poolLiqUSDCETH, poolLiqUSDTETH, "All balances");
    

    api.add(USDC_BSC, poolLiqUSDCBSC);
    api.add(USDT_BSC, poolLiqUSDTBSC);
    api.add(USDC_ETH, poolLiqUSDCETH);
    api.add(USDT_ETH, poolLiqUSDTETH);

    // Two asset accumulated finance
    const poolLiqStZetaAccF = await api.call({ target: TWO_ASSET_POOL_ACCUMULATED_FINANCE, abi: stableSwapBalancesAbi, params: 1 })
    const poolLiqZetaAccF = await api.call({ target: TWO_ASSET_POOL_ACCUMULATED_FINANCE, abi: stableSwapBalancesAbi, params: 0 })

    api.add(ZETA_GAS_TOKEN, poolLiqZetaAccF);
    api.add(STZETA_ACC_FINANCE, poolLiqStZetaAccF);

    // Two asset Zearn
    const poolLiqStZetaZearn = await api.call({ target: TWO_ASSET_POOL_ZEARN, abi: stableSwapBalancesAbi, params: 1 })
    const poolLiqZetaZearn = await api.call({ target: TWO_ASSET_POOL_ZEARN, abi: stableSwapBalancesAbi, params: 0 })

    api.add(ZETA_GAS_TOKEN, poolLiqZetaZearn);
    api.add(STZETA_ZEARN, poolLiqStZetaZearn);

    return api._balances._balances;

}

const zetaTVL = getUniTVL({ factory: '0x9fd96203f7b22bCF72d9DCb40ff98302376cE09c', abis: { getReserves } })

const mergeAndSumTvl = (tvl1, tvl2) => {
  const result = { ...tvl1 };

  for (const key in tvl2) {
    if (result[key]) {
      result[key] = (parseFloat(result[key]) + parseFloat(tvl2[key])).toString();
    } else {
      result[key] = tvl2[key];
    }
  }

  return result;
}

module.exports = {
  methodology: "Sum of tvl of UniV2 pools and StableSwap pools",
  zeta: { tvl: async (api) => {
    const UniV2Tvl = await zetaTVL(api);
    
    const StableSwapTvl = await stableSwapTvl(api);

    const combinedTvl = mergeAndSumTvl(UniV2Tvl, StableSwapTvl);
    
    return combinedTvl;
  }},
};