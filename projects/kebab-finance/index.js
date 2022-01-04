const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");

const masterchef = "0x76FCeffFcf5325c6156cA89639b17464ea833ECd";
const kebab = "0x7979F6C54ebA05E18Ded44C4F986F49a5De551c2";
const poolInfoAbi = {
  inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  name: "poolInfo",
  outputs: [
    { internalType: "contract IBEP20", name: "lpToken", type: "address" },
    { internalType: "uint256", name: "allocPoint", type: "uint256" },
    { internalType: "uint256", name: "lastRewardBlock", type: "uint256" },
    { internalType: "uint256", name: "accCakePerShare", type: "uint256" },
  ],
  stateMutability: "view",
  type: "function",
};

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
  tvl,
};
