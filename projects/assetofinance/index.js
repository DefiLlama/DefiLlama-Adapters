const ethers = require("ethers");
const {default: BigNumber} = require("bignumber.js");

const config = {
    hsk: {
        // product group
        AoABT:
            [
                // child token
                {
                    name: "AoABT",
                    tokenAddress: "0x80C080acd48ED66a35Ae8A24BC1198672215A9bD",
                    pricerAddress: "0xD72529F8b54fcB59010F2141FC328aDa5Aa72abb"
                },

                {
                    name: "AoABTa12m",
                    tokenAddress: "0xf00A183Ae9DAA5ed969818E09fdd76a8e0B627E6",
                    pricerAddress: "0x9BB1a9f99070341eADf705B8B973474EF2b9790F"
                },
                {
                    name: "AoABTb",
                    tokenAddress: "0x34B842D0AcF830134D44075DCbcE43Ba04286c12",
                    pricerAddress: "0x8dB72b8F7F896569F6B254263D559902Ea2A9B35"
                },
            ],


    }
}

async function tvl(api) {
    const tokens = config.hsk.AoABT.map((token) => token.tokenAddress);
    const pricers = config.hsk.AoABT.map((token) => token.pricerAddress);

    const [supplies, prices] = await Promise.all([
        api.multiCall({abi: "erc20:totalSupply", calls: tokens}),
        api.multiCall({abi: "uint256:getLatestPrice", calls: pricers}),
    ]);
    const tvl = tokens.map((token, i) => {
        const supply = BigNumber(supplies[i]).div(1e18);
        const price = BigNumber(prices[i]).div(1e18);

        return supply.times(price);
    }).reduce((a, b) => a.plus(b), BigNumber(0));


    api.addToken(config.hsk.AoABT[0].tokenAddress, tvl.toFixed(0));
}

module.exports = {
    methodology: "Sums the total supplies of Asseto's issued tokens.",
    timetravel: true,
    misrepresentedTokens: true,
    hsk: {
        tvl
    }
};

