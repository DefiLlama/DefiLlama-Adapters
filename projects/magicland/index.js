const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const {addFundsInMasterChef} = require('../helper/masterchef');
const STAKING_CONTRACT = "0x6b614684742717114200dc9f30cBFdCC00fc73Ec";

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformArbitrumAddress();
  await addFundsInMasterChef(
      balances, STAKING_CONTRACT, chainBlocks.arbitrum, 'arbitrum', transformAddress);

  return balances;
};

module.exports={
    arbitrum:{
        tvl: arbitrumTvl
    },
}
