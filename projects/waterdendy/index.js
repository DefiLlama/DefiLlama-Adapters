const { transformArbitrumAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require('../helper/masterchef');

const STAKING_CONTRACT_ARBITRUM = "0xD0834fF6122FF8dcf38E3eB79372C00FAeAFa08B"; //MASTERCHEF ARBITRUM

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const transformAddress = await transformArbitrumAddress();

    await addFundsInMasterChef(
        balances, STAKING_CONTRACT_ARBITRUM, chainBlocks.arbitrum, 'arbitrum', transformAddress);
        delete balances['0x88692aD37c48e8F4c821b71484AE3C2878C2A2C6']; //TOKEN ADDRESS
        return balances;
    };

    module.exports={
    timetravel: true,
    arbitrum: {
        tvl: arbitrumTvl
    },
}
