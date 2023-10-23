const sdk = require("@defillama/sdk");
const { utils, BigNumber } = require("ethers");

const chain = "bsc";

const shydtAddress = "0xab4f1Bb558E564ae294D45a025111277c36C89c0";
const earnAddress = "0x8e48d5b2Ac80d9861d07127F06BbF02F73520Ced";
const coinPairAddress = "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE";
const controlPairAddress = "0xBB8ae522F812E9E65239A0e5db87a9D738ce957a";

const tokenABI = { balanceOf: "erc20:balanceOf" };
const pairABI = "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)";

async function tvl(_, _b, { [chain]: block }) {
    const { output: coinPairReserves } = await sdk.api.abi.call({
        abi: pairABI,
        target: coinPairAddress,
        chain, block,
    });
    const { output: controlPairReserves } = await sdk.api.abi.call({
        abi: pairABI,
        target: controlPairAddress,
        chain, block,
    });
    const controlPrice =
        (controlPairReserves.reserve1 * coinPairReserves.reserve0) /
        (controlPairReserves.reserve0 * coinPairReserves.reserve1);


    const { output: stakeBalance } = await sdk.api.abi.call({
        abi: tokenABI.balanceOf,
        target: shydtAddress,
        params: earnAddress,
        chain, block,
    });
    const totalValueLockedUSD = utils.formatUnits(stakeBalance) * controlPrice;


    return {
        tether: totalValueLockedUSD
    }
}

module.exports = {
    misrepresentedTokens: true,
    methodology: "We get staked amounts from the HYDT staking (earn) contract via contract calls",
    start: 1693763345,
    bsc: {
        tvl,
    },
};
