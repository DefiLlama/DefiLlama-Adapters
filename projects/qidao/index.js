const {sumTokens} = require('../helper/unwrapLPs')

async function polygon(timestamp, block, chainBlocks) {
    const balances = {}
    await sumTokens(balances, [
        // vaults
        ["0x1a13f4ca1d028320a707d99520abfefca3998b7f", "0x22965e296d9a0Cd0E917d6D70EF2573009F8a1bB"], //amUSDC
        ["0x27f8d03b3a2196956ed754badc28d73be8830a6e", "0xE6C23289Ba5A9F0Ef31b8EB36241D5c800889b7b"], //amDAI
        ["0x28424507fefb6f7f8e9d3860f56504e4e5f5f390", "0x0470CD31C8FcC42671465880BA81D631F0B76C1D"], //amWETH
        ["0x60d55f02a771d515e077c9c2403a1ef324885cec", "0xB3911259f435b28EC072E4Ff6fF5A2C604fea0Fb"], //amUSDT
        ["0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4", "0x7068Ea5255cb05931EFa8026Bd04b18F3DeB8b0B"], //amMATIC
        ["0x1d2a0e5ec8e5bbdca5cb219e649b565d8e5c3360", "0xeA4040B21cb68afb94889cB60834b13427CFc4EB"], //amAAVE
        ["0x5c2ed810328349100a66b82b78a1791b101c9d61", "0xBa6273A78a23169e01317bd0f6338547F869E8Df"], // amWBTC
        // usdc swap
        ["0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "0x947D711C25220d8301C087b25BA111FE8Cbf6672"],
        // mai vaults
        ["0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", "0x3fd939B017b31eaADF9ae50C7fF7Fa5c0661d47C"], // weth
        ["0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39", "0x61167073E31b1DAd85a3E531211c7B8F1E5cAE72"], // link
        ["0xd6df932a45c0f255f85145f286ea0b292b21c90b", "0x87ee36f780ae843A78D5735867bc1c13792b7b11"], // aave
        ["0x172370d5cd63279efa6d502dab29171933a610af", "0x98B5F32dd9670191568b661a3e847Ed764943875"], // crv
    ], chainBlocks.polygon, 'polygon', addr=>`polygon:${addr}`)
    return balances
}

module.exports = {
    polygon: {
        tvl: polygon
    },
    tvl: polygon
}