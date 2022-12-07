const { sumNFTTokens, } = require('../../helper/nft');

// Vaults
const v2 = "0xf896527c49b44aAb3Cf22aE356Fa3AF8E331F280";
const v2_1 = "0x8252Df1d8b29057d1Afe3062bf5a64D503152BC8";

async function getTVL(balances, chain, timestamp, chainBlocks) {
    return sumNFTTokens({ chain, block: chainBlocks[chain], balances, owners: [v2, v2_1], })
}

module.exports = {
    getTVL,
};
