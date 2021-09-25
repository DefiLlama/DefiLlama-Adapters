const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const {getBlock} = require('../helper/getBlock');
const {addFundsInMasterChef} = require('../helper/masterchef');
const { staking } = require("../helper/staking");
const STAKING_CONTRACT = "0x1cCf20F4eE3EFD291267c07268BEcbFDFd192311";
const PPEG = '0x78055daa07035aa5ebc3e5139c281ce6312e1b22'

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformArbitrumAddress();
  const block = await getBlock(timestamp, "arbitrum", chainBlocks)
  await addFundsInMasterChef(
      balances, STAKING_CONTRACT, block, 'arbitrum', transformAddress, undefined, [PPEG]);
  return balances;
};

module.exports={
  methodology: 'All tokens and LP tokens staked on the Masterchef (0x1cCf20F4eE3EFD291267c07268BEcbFDFd192311) are counted as the TVL, with the exception of the native token(PPEGG) which is considered staking TVL.',
    arbitrum: {
        tvl: arbitrumTvl
    },
    tvl: sdk.util.sumChainTvls([arbitrumTvl]),
    staking:{
        tvl: staking(STAKING_CONTRACT, PPEG, "arbitrum", `arbitrum:${PPEG}`)
    }
}
