const ADDRESSES = require('../helper/coreAssets.json')
const GGAVAX_CONTRACT = '0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3';
const GGP_STAKING_CONTRACT = '0xB6dDbf75e2F0C7FC363B47B84b5C03959526AecB';
const MINIPOOL_MANAGER_CONTRACT = '0xb84fA022c7fE1CE3a1F94C49f2F13236C3d1Ed08';

const ggAVAXTotalAssetsAbi = "function totalAssets() view returns (uint256)";
const AvaxInMinipoolsABI = "function getTotalAVAXLiquidStakerAmt() view returns (uint256)";
const GGPStakedAbi = "function getTotalGGPStake() view returns (uint256)";

const wavax = ADDRESSES.avax.WAVAX;
const ggp = "0x69260B9483F9871ca57f81A90D91E2F96c2Cd11d";

async function tvl(api) {
  const avax_lst_side = await api.call({  abi: ggAVAXTotalAssetsAbi, target: GGAVAX_CONTRACT });
  // Minipool operators are matched with LST AVAX 1:1
  const avax_minipool_side = await api.call({ abi: AvaxInMinipoolsABI, target: MINIPOOL_MANAGER_CONTRACT });

  // Minipool operators must deposit GGP in the protocol to be matched with AVAX
  const ggp_staked = await api.call({  abi: GGPStakedAbi, target: GGP_STAKING_CONTRACT });

  const AVAX_TVL = parseFloat(avax_lst_side) +  parseFloat(avax_minipool_side);
  const GGP_tvl = ggp_staked;

  api.addTokens([wavax, ggp], [AVAX_TVL, GGP_tvl]) // add tokens to api (balances)
}

module.exports = {
  methodology: "GoGoPool TVL = AVAX on the LST side + AVAX on the Minipool side + GGP staked by GGP operators.",
  avax: {
    tvl,
  }
}