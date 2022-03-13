const sdk = require("@defillama/sdk");

const tokenAndContract = [
    ["0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", "0x6d9336ce867606Dcb1aeC02C8Ef0EDF0FF22d247"], // nWAVAX
    ["0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", "0x92F79834fC52f0Aa328f991C91185e081ea4f957"], // nWETH
    ["0x50b7545627a5162F82A992c33b87aDc75187B218", "0x3D8231cE419886a5D400dD5a168C8917aEeAB25C"], // nWBTC
    ["0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", "0x6Ce0e6e81Dc7A5D997E6169cD5f8C982DA83e49e"], // nDAI
    ["0xc7198437980c041c805A1EDcbA50c1Ce5db95118", "0x29F511e6f62118b27D9B47d1AcD6fDd5cD0B4C64"], // nUSDT
    ["0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", "0x723191E7F8D87eC22E682c13Df504E5E3432e53E"] // nUSDC
]

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    block = chainBlocks.avax;
    const chain = "avax";

    const collateralBalances = (await sdk.api.abi.multiCall({
        calls: tokenAndContract.map(p => ({
            target: p[0],
            params: p[1]
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;

    collateralBalances.forEach(p => {
        sdk.util.sumSingleBalance(balances, `avax:${p.input.target}`, p.output);
    })

    return balances;
}

module.exports = {
    avalanche: {
        tvl
    }
}