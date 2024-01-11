const sdk = require("@defillama/sdk");
const { eth } = require("@defillama/sdk/build/api");

const SIZE_S_C ="0x044d9B2C4d8A696Fe83FBB723F6006bd2d7a0E7e";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const blockNumber = 9061457
async function tvl(timestamp,chainBlocks) {
const usdcBalance = (
await sdk.api.erc20.balanceOf({
target: USDC_ADDRESS,
owner: SIZE_S_C,
block: blockNumber,
chain: "base",
})
).output;

return {
    "0x044d9B2C4d8A696Fe83FBB723F6006bd2d7a0E7e": usdcBalance, // USDC address
};
}

module.exports = {
methodology: "USDC tokens",
base: {
tvl,
borrowed
},
};

