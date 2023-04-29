const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const {staking} = require('../helper/staking')

// BRI
const BrightRiskIndex = "0xa4b032895BcB6B11ec7d21380f557919D448FD04";
// Staking
const BRIGHT = "0xbeab712832112bd7664226db7cd025b153d3af55";
const BrightStaking = "0x1EB7c3CBac942983B80b384A978946DcEDc6CF5a";
const BrightLPStaking = ["0x160c43821004Cb76C7e9727159dD64ab8468f61C"];

//UNIV2
const ETH_BRIGHT_UNIV2 = "0xf4835af5387fab6bbc59f496cbcfa92998469b7b";
const DAI = ADDRESSES.ethereum.DAI

async function tvl (timestamp, block) {
    return {
        [DAI]: (await sdk.api.abi.call({
            target: BrightRiskIndex,
            block,
            abi: abi["totalTVL"]
        })).output
    }
}

module.exports = {
    ethereum: {
        tvl: tvl,
        pool2: staking(BrightLPStaking, [ETH_BRIGHT_UNIV2]),
        staking: staking(BrightStaking, BRIGHT),
    },
};
