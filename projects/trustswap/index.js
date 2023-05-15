const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const staking_contract = "0x5A753021CE28CBC5A7c51f732ba83873D673d8cC";

const assets = [
  // other tokens which probably for some reason was sent to the contract accidentally
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.UNI,
];

const stakingTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const token = (
    await sdk.api.abi.call({
      abi: abi.token,
      target: staking_contract,
      block: ethBlock,
    })
  ).output;

  const currentTotalStake = (
    await sdk.api.abi.call({
      abi: abi.currentTotalStake,
      target: staking_contract,
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, token, currentTotalStake);

  return balances;
};

async function ethTvl(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  for (let i = 0; i < assets.length; i++) {
    const assetsBalance = (
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: assets[i],
        params: staking_contract,
        block: ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, assets[i], assetsBalance);
  }

return balances
}


module.exports = {
  methodology: `Counts SWAP tokens locked int the staking contract(0x5A753021CE28CBC5A7c51f732ba83873D673d8cC). Regular TVL counts UNI, USDT, and USDC that are also in the staking contract(these tokens may have been sent to the contract by accident).`,
  ethereum: {
    tvl: ethTvl,
    staking: stakingTvl
  },
};
