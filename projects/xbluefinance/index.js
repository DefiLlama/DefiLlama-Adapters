const { transformArbitrumAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require('../helper/masterchef');

const STAKING_CONTRACT_ARBITRUM = "0xd139490F63d220CacA960DA9E40Ad59Fc3AdcB15"; //MASTERCHEF ARBITRUM

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const transformAddress = await transformArbitrumAddress();

    await addFundsInMasterChef(
        balances, STAKING_CONTRACT_ARBITRUM, chainBlocks.arbitrum, 'arbitrum', transformAddress);
        delete balances['0x50AA7A13B28EeA97dc6C3f5E8aaa7fE512e7306D']; //TOKEN ADDRESS
        return balances;
    };

    module.exports={
    timetravel: true,
    arbitrum: {
        tvl: arbitrumTvl
    },
}

