const { transformArbitrumAddress } = require("./helper/portedTokens");
const { getBlock } = require('./helper/getBlock');
const { addFundsInMasterChef } = require('./helper/masterchef');
const { staking } = require("./helper/staking");
const STAKING_CONTRACT = "0xAd60A8cb60e052196F5B968B4bd4328A67Df27d3";
const JAGUAR = '0x31535F7A83083E3f34899F356ECC7246FBF2E82D'

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformArbitrumAddress();
  const block = await getBlock(timestamp, "arbitrum", chainBlocks)
  await addFundsInMasterChef(
    balances, STAKING_CONTRACT, block, 'arbitrum', transformAddress, undefined, [JAGUAR]);
  return balances;
};

module.exports = {
  methodology: 'All tokens and LP tokens staked on the Masterchef (0x1cCf20F4eE3EFD291267c07268BEcbFDFd192311) are counted as the TVL, with the exception of the native token(JAGUAR) which is considered staking TVL.',
  arbitrum: {
    tvl: arbitrumTvl,
    staking: staking(STAKING_CONTRACT, JAGUAR, "arbitrum", `arbitrum:${JAGUAR}`)
  },
}
// node test.js projects/jaguarswap.js
