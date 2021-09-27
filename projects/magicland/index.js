const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const {addFundsInMasterChef} = require('../helper/masterchef');
const STAKING_CONTRACT = "0x6b614684742717114200dc9f30cBFdCC00fc73Ec";

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformArbitrumAddress();
  await addFundsInMasterChef(
      balances, STAKING_CONTRACT, chainBlocks.arbitrum, 'arbitrum', transformAddress);
  delete balances['0x2c852d3334188be136bfc540ef2bb8c37b590bad'];
  delete balances['0x2c852D3334188BE136bFC540EF2bB8C37b590BAD'];
  return balances;
};
const stakingTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const transformAddress = await transformArbitrumAddress();
    await addFundsInMasterChef(
        balances, STAKING_CONTRACT, chainBlocks.arbitrum, 'arbitrum', transformAddress);
    let staked = {};
    staked['0x2c852d3334188be136bfc540ef2bb8c37b590bad'] = 
        balances['0x2c852d3334188be136bfc540ef2bb8c37b590bad'] +
        balances['0x2c852D3334188BE136bFC540EF2bB8C37b590BAD'];
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