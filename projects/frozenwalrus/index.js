const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniTVL } = require("../helper/unknownTokens")

const wlrTokenAddress = "0x395908aeb53d33A9B8ac35e148E9805D34A555D3";
const wshareTokenAddress = "0xe6d1aFea0B76C8f51024683DD27FA446dDAF34B6";
const masonryAddress = "0x38B0b6Ef43c4262659523986D731f9465F871439";
const treasuryAddress = "0xDb8618e899FD9fa4B8E6DBd1E00BCA89E4DaF9cd";
const chain = 'avax'

const ftmLPs = [
    "0x82845B52b53c80595bbF78129126bD3E6Fc2C1DF", // tombFtmLpAddress
    "0x03d15E0451e54Eec95ac5AcB5B0a7ce69638c62A", //tshareFtmLpAddress
];

async function pool2(timestamp, _b, { [chain]: block }) {
    return sumTokens2({
        chain, block, owner: tokens: ftmLPs, resolveLP: true,
    })
}

async function staking(timestamp, _b, { [chain]: block }) {
    const toa = [
        [tshareTokenAddress, masonryAddress,],
    ]

    return sumTokens2({
        chain, block, tokensAndOwners: toa,
    })
}


module.exports = {
    methodology: "Pool2 deposits consist of TOMB/FTM and TSHARE/FTM LP tokens deposits while the staking TVL consists of the TSHARES tokens locked within the Masonry contract(0x8764de60236c5843d9faeb1b638fbce962773b67).",
    avax: {
        pool2,
        staking,
    },
};