const sdk = require("@defillama/sdk")

const stakingContracts = [
    "0xc3ab35d3075430f52D2636d08D4f29bD39a18B65",
    "0xcD48268d66068963242681Ed7ca39d349Fb690B9",
    "0x2F0596b989d79fda9b0A89F57D982ea02f8D978B",
];
const boggedToken = "0xb09fe1613fe03e7361319d2a43edc17422f36b09";

async function tvl(timestamp, ethBlock, chainBlocks) {
    return {};
};
async function staking(timestamp, ethBlock, chainBlocks) {
    let balances = { "bogged-finance": 0 };

    const contractBalances = (await sdk.api.abi.multiCall({
        block: chainBlocks["bsc"],
        target: boggedToken,
        calls: stakingContracts.map(h => ({ params: h })),
        abi: 'erc20:balanceOf',
        chain: "bsc"
      })).output;

    for (const contractBalance of contractBalances) {
        balances["bogged-finance"] += Number(contractBalance.output / 10**18);
    }
    return balances;
};

module.exports = { 
    tvl,
    staking: {
        tvl: staking
    }
}