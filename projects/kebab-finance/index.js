const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");

const masterchef = "0x76FCeffFcf5325c6156cA89639b17464ea833ECd";
const kebab = "0x7979F6C54ebA05E18Ded44C4F986F49a5De551c2";
const poolInfoAbi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCakePerShare)';

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  const transform = await transformBscAddress();
  await addFundsInMasterChef(
    balances,
    masterchef,
    chainBlocks.bsc,
    "bsc",
    transform,
    poolInfoAbi,
    [kebab]
  );

  return balances;
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  let stakeBalance = (
    await sdk.api.erc20.balanceOf({
      target: kebab,
      owner: masterchef,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  sdk.util.sumSingleBalance(balances, `bsc:${kebab}`, stakeBalance);
  return balances;
}

module.exports = {
  bsc: {
    tvl,
    staking,
  },
};
