const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");
const vestaFarmingAbi = require("./vestaFarming.abi.json");
const { sumBalancerLps, unwrapCrv } = require("../helper/unwrapLPs.js");
const { transformArbitrumAddress } = require("../helper/portedTokens");

const VaultTokens = {
  gOHM: "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1",
  ETH: "0x0000000000000000000000000000000000000000",
  renBTC: "0xdbf31df14b66535af65aac99c32e9ea844e14501",
  DPX: "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
  GMX: "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a"
}

const gOHM_ETHMAINNET_ADDRESS = '0x0ab87046fbb341d058f17cbc4c1133f25a20a52f';
const renBTC_ETHMAINNET_ADDRESS = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';
const ETH_ETHMAINNET_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const VSTA_FARMING_ADDRESS = "0x65207da01293C692a37f59D1D9b1624F0f21177c";
const LP_VSTA_ETH_ADDRESS = "0xc61ff48f94d801c1ceface0289085197b5ec44f0";

const VST_FARMING_ADDRESS = "0xB3667b3d1b3D4ed3d451dF68C9C12A686227Bada";
const LP_VST_FRAX_ADDRESS = "0x59bF0545FCa0E5Ad48E13DA269faCD2E8C886Ba4";

const FRAX_ADDRESS = "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F";

// TroveManager holds total system collateral for each individual vaults
const TROVE_MANAGER_ADDRESS = "0x100EC08129e0FD59959df93a8b914944A3BbD5df";

const chain = "arbitrum";

async function tvl(_, block, chainBlocks) {
  block = chainBlocks.arbitrum;


  const vaultTotalCollateralData = await Promise.all(Object.keys(VaultTokens).map( async token => {
    const totalCollateral = await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
      params: [VaultTokens[token]],
      chain,
    });

    const parsedData = () => {
      switch(token){
        case "renBTC": return {tokenAddress: renBTC_ETHMAINNET_ADDRESS, data: totalCollateral.output / 10 ** 10};
        case "gOHM": return {tokenAddress: gOHM_ETHMAINNET_ADDRESS, data: totalCollateral.output};
        case "ETH": return {tokenAddress: ETH_ETHMAINNET_ADDRESS, data: totalCollateral.output};
        default: return {tokenAddress: VaultTokens[token], data: totalCollateral.output};
      }
    }

    return parsedData();
  }
  ));

  const vaultTvls = vaultTotalCollateralData.reduce((a,b)=>({...a, [b.tokenAddress]: b.data}), {})

  const curveBalances = (
    await sdk.api.abi.call({
      target: VST_FARMING_ADDRESS,
      abi: vestaFarmingAbi,
      block,
      params: [],
      chain,
    })
  ).output;

  const crvBal = {};
  await unwrapCrv(crvBal, LP_VST_FRAX_ADDRESS, curveBalances, block, chain);

  return {
    ...vaultTvls,
    ['0x853d955acef822db058eb8505911ed77f175b99e']: crvBal[FRAX_ADDRESS],
  };
};

async function pool2(_timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformArbitrumAddress();
  await sumBalancerLps(
    balances,
    [[LP_VSTA_ETH_ADDRESS, VSTA_FARMING_ADDRESS]],
    chainBlocks.arbitrum,
    chain,
    transform
  );
  return balances;
};

module.exports = {
  arbitrum: {
    tvl,
    pool2,
  },
  start: 1644339600,
  timetravel: true,
  methodology:
    "Total Value Locked includes all stability pools, troves, and vst pairs",
};