const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json")

const maticAddress = "0x0000000000000000000000000000000000001010";
const troveManagerAddress = "0x68738A47d40C34d890168aB7B612A6f649f395e4";
const avaxAddress = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const troveManagerAddress_avax = "0x561d2d58bDAD7a723a2cF71e8909A409Dc2112ec";

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const info  = (
        await sdk.api.abi.call({
            target: troveManagerAddress,
            abi: getEntireSystemCollAbi,
            block: chainBlocks['polygon'],
            chain: 'polygon'
        })
    ).output;

    sdk.util.sumSingleBalance(balances, `polygon:${maticAddress}`, info);

    return balances;
};

const avalancheTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const info  = (
        await sdk.api.abi.call({
            target: troveManagerAddress_avax,
            abi: getEntireSystemCollAbi,
            block: chainBlocks['avax'],
            chain: 'avax'
        })
    ).output;

    sdk.util.sumSingleBalance(balances, `avax:${avaxAddress}`, info);

    return balances;
};

module.exports = {
    polygon: {
        tvl: polygonTvl,
    },
    avalanche: {
        tvl: avalancheTvl,
    },
    tvl: sdk.util.sumChainTvls([polygonTvl, avalancheTvl]),
};
