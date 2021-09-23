const sdk = require("@defillama/sdk");
const { transformHecoAddress } = require("../helper/portedTokens");
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const MASTERCHEF_CONTRACT = "0xa02fF30986211B7ca571AcAE5AD4D25ab1e58426";
const PIPPI_FACTORY  = "0x979efE7cA072b72d6388f415d042951dDF13036e";

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {

    const transformAddress = await transformHecoAddress();

    return calculateUniTvl(transformAddress, chainBlocks['heco'], 'heco', PIPPI_FACTORY, 0, true);
}

module.exports = {
    heco: {
        tvl: hecoTvl,
    },
    tvl: sdk.util.sumChainTvls([hecoTvl]),
};