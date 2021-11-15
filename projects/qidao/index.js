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
        ['0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7', '0xF086dEdf6a89e7B16145b03a6CB0C0a9979F1433'],
    ], chainBlocks.polygon, 'polygon', addr=>`polygon:${addr}`)
    balances['polygon:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'] = (await sdk.api.eth.getBalance({
        target: "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
        block: chainBlocks.polygon,
        chain: 'polygon'
    })).output
    return balances
}

async function fantom(timestamp, block, chainBlocks) {
    const balances = {}
    const chain = 'fantom'
    await sumTokens(balances, [
        ["0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", "0x1066b8FC999c1eE94241344818486D5f944331A0"],
        ["0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0", "0x7efB260662a6FA95c1CE1092c53Ca23733202798"],
        ["0x637eC617c86D24E421328e6CAEa1d92114892439", "0x682E473FcA490B0adFA7EfE94083C1E63f28F034"],
        ["0x74b23882a30290451A17c44f4F05243b6b58C76d", "0xD939c268C49c442F037E968F045ba02f499562D4"],
        ['0x321162Cd933E2Be498Cd2267a90534A804051b11', '0xE5996a2cB60eA57F03bf332b5ADC517035d8d094'],
        ['0xae75A438b2E0cB8Bb01Ec1E1e376De11D44477CC', '0x267bDD1C19C932CE03c7A62BBe5b95375F9160A6'],
        ['0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8', '0xd6488d586E8Fcd53220e4804D767F19F5C846086'],
        ['0x6a07A792ab2965C72a5B8088d3a069A7aC3a993B', '0xdB09908b82499CAdb9E6108444D5042f81569bD9'],
        ['0x49c68edb7aebd968f197121453e41b8704acde0c', '0x3609A304c6A41d87E895b9c1fd18c02ba989Ba90'],
        ['0x0a03d2c1cfca48075992d810cc69bd9fe026384a', '0xC1c7eF18ABC94013F6c58C6CdF9e829A48075b4e'],
        ['0x97927abfe1abbe5429cbe79260b290222fc9fbba', '0x5563Cc1ee23c4b17C861418cFF16641D46E12436'],
        ['0x6dfe2aaea9daadadf0865b661b53040e842640f8', '0x8e5e4D08485673770Ab372c05f95081BE0636Fa2'],
        ['0x920786cff2a6f601975874bb24c63f0115df7dc8', '0xBf0ff8ac03f3E0DD7d8faA9b571ebA999a854146'],
    ], chainBlocks[chain], chain, addr=>{
        if(addr === "0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0"){
            return "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
        } else if(addr === "0x637eC617c86D24E421328e6CAEa1d92114892439"){
            return "0x6b175474e89094c44da98b954eedeac495271d0f"
        } else if (addr === "0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8"){
            return "0x514910771af9ca656af840dff83e8264ecf986ca"
        } else if (addr === "0x0a03d2c1cfca48075992d810cc69bd9fe026384a"){
            return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        } else if (addr === "0x97927abfe1abbe5429cbe79260b290222fc9fbba"){
            return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
        } else if (addr === "0x6dfe2aaea9daadadf0865b661b53040e842640f8"){
            return "0x514910771af9ca656af840dff83e8264ecf986ca"
        } else if (addr === "0x920786cff2a6f601975874bb24c63f0115df7dc8"){
            return "0x6b175474e89094c44da98b954eedeac495271d0f"
        } else if (addr === "0x49c68edb7aebd968f197121453e41b8704acde0c"){
            return "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
        }
        return `${chain}:${addr}`
    })
    return balances
}

async function avax(timestamp, block, chainBlocks) {
    const balances = {};
    const chain = 'avax';
    await sumTokens(balances, [
        ["0x1B156C5c75E9dF4CAAb2a5cc5999aC58ff4F9090","0xfA19c1d104F4AEfb8d5564f02B3AdCa1b515da58"]
    ], chainBlocks[chain], chain, addr=>{
        if(addr === "0x1B156C5c75E9dF4CAAb2a5cc5999aC58ff4F9090") {
            return "avax:0x63a72806098bd3d9520cc43356dd78afe5d386d9"
        }
        return `${chain}:${addr}`
    })
    return balances;
}

module.exports = {
    methodology: 'TVL counts the AAVE tokens that are deposited within the Yield Instruments section of QiDao, the Vault token deposits of CRV, LINK, AAVE and WETH, as well as USDC deposited to mint MAI.',
    polygon: {
        tvl: polygon
    },
    fantom:{
        tvl: fantom
    },
    avax: {
        tvl: avax
    }
}