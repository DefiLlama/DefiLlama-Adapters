const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const staking_contract = "0xa8CD01322Ad632c9656879e99Fd7FbC11ca8E3BB";

const assets = [
  // other tokens which probably for some reason was sent to the contract accidentally
  "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
  "0x3a34FA9a1288597Ad6C1Da709f001D37FeF8b19e",
  "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
];

const stakingTvl = async (timestamp, eraBlock, chainBlocks) => {
  const balances = {};

  const token = (
    await sdk.api.abi.call({
      abi: abi.token,
      target: staking_contract,
      block: eraBlock,
    })
  ).output;

  const currentTotalStake = (
    await sdk.api.abi.call({
      abi: abi.currentTotalStake,
      target: staking_contract,
      block: eraBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, token, currentTotalStake);

  return balances;
};

async function eraTvl(timestamp, eraBlock, chainBlocks) {
  let balances = {};
  for (let i = 0; i < assets.length; i++) {
    const assetsBalance = (
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: assets[i],
        params: staking_contract,
        block: eraBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, assets[i], assetsBalance);
  }

return balances
}


module.exports = {
  methodology: `Counts SWAP tokens locked int the staking contract(0xa8CD01322Ad632c9656879e99Fd7FbC11ca8E3BB). Regular TVL counts SDYX, USDC, and WETH that are also in the staking contract(these tokens may have been sent to the contract by accident).`,
  era: {
    tvl: eraTvl,
    staking: stakingTvl
  },
};