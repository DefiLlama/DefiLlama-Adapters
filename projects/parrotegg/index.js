const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const {addFundsInMasterChef} = require('../helper/masterchef');
const STAKING_CONTRACT = "0x1cCf20F4eE3EFD291267c07268BEcbFDFd192311";

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformArbitrumAddress();
  await addFundsInMasterChef(
      balances, STAKING_CONTRACT, chainBlocks.arbitrum, 'arbitrum', transformAddress);
  delete balances['0x78055daa07035aa5ebc3e5139c281ce6312e1b22'];
  delete balances['0x78055dAA07035Aa5EBC3e5139C281Ce6312E1b22'];
  return balances;
};
const stakingTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const transformAddress = await transformArbitrumAddress();
    await addFundsInMasterChef(
        balances, STAKING_CONTRACT, chainBlocks.arbitrum, 'arbitrum', transformAddress);
    let staked = {};
    staked['0x78055daa07035aa5ebc3e5139c281ce6312e1b22'] = 
        balances['0x78055daa07035aa5ebc3e5139c281ce6312e1b22'] +
        balances['0x78055dAA07035Aa5EBC3e5139C281Ce6312E1b22'];
    return staked;
  };

module.exports={
    arbitrum: {
        tvl: arbitrumTvl
    },
    tvl: sdk.util.sumChainTvls([arbitrumTvl]),
    staking:{
        tvl: stakingTvl
    }
}