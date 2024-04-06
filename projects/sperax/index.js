const { staking } = require("../helper/staking.js");
const ethStakingAddr = "0xbF82a3212e13b2d407D10f5107b5C8404dE7F403";
const arbStakingAddr = "0x2e2071180682Ce6C247B1eF93d382D509F5F6A17";

const SPA = '0x5575552988a3a80504bbaeb1311674fcfd40ad4b';
const ethSPA = '0xB4A3B0Faf0Ab53df58001804DdA5Bfc6a3D59008';

async function tvl(api) {
  const vault = '0x6Bbc476Ee35CBA9e9c3A59fc5b10d7a0BC6f74Ca'
  const collateralManager = await api.call({  abi: 'address:collateralManager', target: vault})
  const tokens = await api.call({  abi: 'address[]:getAllCollaterals', target: collateralManager})
  const bals = await api.multiCall({  abi: 'function getCollateralInVault(address) view returns (uint256)', calls: tokens, target: collateralManager  })
  const bals2 = await api.multiCall({  abi: 'function getCollateralInStrategies(address) view returns (uint256)', calls: tokens, target: collateralManager  })
  api.add(tokens, bals)
  api.add(tokens, bals2)
}

module.exports = {
  arbitrum: {
    tvl,
    staking: staking(arbStakingAddr, SPA)
  },
  ethereum: {
    tvl: () => ({}),
    staking: staking(ethStakingAddr, ethSPA)
  },
  methodology: 'Counts all collateral locked to mint USDs.This collateral is either sent to DeFi strategies to produce an organic yield, or is stored in the VaultCore contract of the USDs protocol. Some TVL is classified as staking. This component of TVL consists of all SPA staked in Sperax’s veSPA protocol.'
};