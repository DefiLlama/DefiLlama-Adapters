/**
 * Auxite - Tokenized Precious Metals (RWA)
 */

const ADDRESSES = require('../helper/coreAssets.json');

const AUXITE_TOKENS = {
  AUXG: "0x390164702040B509A3D752243F92C2Ac0318989D",
  AUXS: "0x82F6EB8Ba5C84c8Fd395b25a7A40ade08F0868aa",
  AUXPT: "0x119de594170b68561b1761ae1246C5154F94705d",
  AUXPD: "0xe051B2603617277Ab50C509F5A38C16056C1C908",
};

const ORACLE_ADDRESS = "0x585314943599C810698E3263aE9F9ec4C1C25Ff2";
const STAKING_CONTRACT = "0x1656DcCC8277bC7D6aF93F71464D64ebBC15574d";

const ORACLE_ABI = {
  getAllPrices: "function getAllPrices() view returns (uint256 gold, uint256 silver, uint256 platinum, uint256 palladium, uint256 eth)",
};

async function getPrices(api) {
  const allPrices = await api.call({
    target: ORACLE_ADDRESS,
    abi: ORACLE_ABI.getAllPrices
  });
  
  return {
    AUXG: allPrices.gold || allPrices[0],
    AUXS: allPrices.silver || allPrices[1],
    AUXPT: allPrices.platinum || allPrices[2],
    AUXPD: allPrices.palladium || allPrices[3],
  };
}

async function calculateTvl(api, balances, prices) {
  const USDC_BASE = ADDRESSES.base?.USDC || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
  let totalUsdcUnits = 0n;
  
  Object.keys(AUXITE_TOKENS).forEach((symbol, i) => {
    const balance = BigInt(balances[i] || 0);
    const pricePerKgE6 = BigInt(prices[symbol] || 0);
    const valueUsdc = (balance * pricePerKgE6) / 1000000n;
    totalUsdcUnits += valueUsdc;
  });
  
  api.add(USDC_BASE, totalUsdcUnits.toString());
}

module.exports = {
  methodology: "TVL is calculated from total supply of AUXG, AUXS, AUXPT, AUXPD tokens multiplied by metal prices from Auxite Oracle. Each token = 1 gram of physically-backed precious metal.",
  
  base: {
    tvl: async (api) => {
      const [supplies, prices] = await Promise.all([
        api.multiCall({
          abi: 'erc20:totalSupply',
          calls: Object.values(AUXITE_TOKENS),
        }),
        getPrices(api)
      ]);
      await calculateTvl(api, supplies, prices);
    },
    
    staking: async (api) => {
      const [stakedBalances, prices] = await Promise.all([
        api.multiCall({
          abi: 'erc20:balanceOf',
          calls: Object.values(AUXITE_TOKENS).map(token => ({
            target: token,
            params: [STAKING_CONTRACT]
          })),
        }),
        getPrices(api)
      ]);
      await calculateTvl(api, stakedBalances, prices);
    },
  },
  
  doublecounted: true,
  misrepresentedTokens: true,
};

module.exports.hallmarks = [
  ['2026-02-02', "V8 tokens deployed on Base Mainnet"],
];
