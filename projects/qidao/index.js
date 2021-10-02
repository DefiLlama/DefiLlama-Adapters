const {sumTokens} = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

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
        // anchor
        ["0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "0x947D711C25220d8301C087b25BA111FE8Cbf6672"], //USDC 
        ["0xc2132d05d31c914a87c6611c10748aeb04b58e8f", "0xa4742A65f24291AA421497221AaF64c70b098d98"], //USDT
        ["0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", "0x6062E92599a77E62e0cC9749261eb2eaC3aBD44F"], //DAI
        // mai vaults
        ["0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", "0x3fd939B017b31eaADF9ae50C7fF7Fa5c0661d47C"], // weth
        ["0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39", "0x61167073E31b1DAd85a3E531211c7B8F1E5cAE72"], // link
        ["0xd6df932a45c0f255f85145f286ea0b292b21c90b", "0x87ee36f780ae843A78D5735867bc1c13792b7b11"], // aave
        ["0x172370d5cd63279efa6d502dab29171933a610af", "0x98B5F32dd9670191568b661a3e847Ed764943875"], // crv
        ["0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", "0x37131aEDd3da288467B6EBe9A77C523A700E6Ca1"], // wbtc
        // added
        ["0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3", "0x701A1824e5574B0b6b1c8dA808B184a7AB7A2867"], //bal
        ["0xf28164a485b0b2c90639e47b0f377b4a438a16b1", "0x649Aa6E6b6194250C077DF4fB37c23EE6c098513"], //dquick
    ], chainBlocks.polygon, 'polygon', addr=>`polygon:${addr}`)
    balances['polygon:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'] = (await sdk.api.eth.getBalance({
        target: "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
        block: chainBlocks.polygon,
        chain: 'polygon'
    })).output
    return balances
}

module.exports = {
    methodology: 'TVL counts the AAVE tokens that are deposited within the Yield Instruments section of QiDao, the Vault token deposits of CRV, LINK, AAVE and WETH, as well as USDC deposited to mint MAI.',
    polygon: {
        tvl: polygon
    },
    tvl: polygon
}