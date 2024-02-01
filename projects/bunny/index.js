const sdk = require('@defillama/sdk')
const abi = 'function tvlOfPool(address pool) view returns (uint256 tvl)'
const potABI = "uint256:totalValueInUSD"
const leverageABI = 'function getVaultState() view returns (tuple(uint256 balance, uint256 tvl, uint256 debtRatioLimit))'
const BigNumber = require('bignumber.js')

const dashboard = '0xb3C96d3C3d643c2318E4CDD0a9A48aF53131F5f4'
const pools = [
    '0xb037581cF0cE10b04C4735443d95e0C93db5d940',
    '0x4fd0143a3DA1E4BA762D42fF53BE5Fab633e014D',
    //'0x69FF781Cf86d42af9Bf93c06B8bE0F16a2905cBC', // pool2
    '0xCADc8CB26c8C7cB46500E61171b5F27e9bd7889D',
    '0xEDfcB78e73f7bA6aD2D829bf5D462a0924da28eD',
    '0x7eaaEaF2aB59C2c85a17BEB15B110F81b192e98a',
    '0x3f139386406b0924eF115BAFF71D0d30CC090Bd5',
    '0x0137d886e832842a3B11c568d5992Ae73f7A792e',
    '0xCBd4472cbeB7229278F841b2a81F1c0DF1AD0058',
    '0xE02BCFa3D0072AD2F52eD917a7b125e257c26032',
    '0x41dF17D1De8D4E43d5493eb96e01100908FCcc4f',
    '0x1b6e3d394f1D809769407DEA84711cF57e507B99',
    '0x92a0f75a0f07C90a7EcB65eDD549Fa6a45a4975C',
    '0xC1aAE51746bEA1a1Ec6f17A4f75b422F8a656ee6',
    '0xE07BdaAc4573a00208D148bD5b3e5d2Ae4Ebd0Cc',
    '0xa59EFEf41040e258191a4096DC202583765a43E7',
    '0xa5B8cdd3787832AdEdFe5a04bF4A307051538FF2',
    '0xC0314BbE19D4D5b048D3A3B974f0cA1B2cEE5eF3',
    '0x866FD0028eb7fc7eeD02deF330B05aB503e199d4',
    '0x52cFa188A1468A521A98eaa798E715Fbb9eb38a3',
    '0x22af73683dee5D266B0c36c37D0Fd62c402Fd250',
    '0x549d2e2B4fA19179CA5020A981600571C2954F6a',
    '0x0Ba950F0f099229828c10a9B307280a450133FFc',
    '0x0243A20B20ECa78ddEDF6b8ddb43a0286438A67A',
    '0xD1ad1943b70340783eD9814ffEdcAaAe459B6c39',

    // pancakeswap v2
    '0xa6C29a422D1612293669156a34f2793526783622',
    '0xA599d6b81eC4a5DDd8eCa85e3AAc31E006aF00AA',
    '0x203Ee29ba85BbDfA23bFaE5D77620AeFDaf92cB1',
    '0x285F793CE97079D4a5712E616AFBbb971Dbf1f1f',
    '0xac20925e6615ad6871987e199783Fa80Bf24EB39',
    '0x0d17e7B77C678C79C3ab5176e164FF0BCceb8EAa',
    '0x7D52a1697F2dF08E6fb2b5A88E0E8e4D7C11a921',
    '0xE0aca387C6600b455CCFC32B253e2DB13b71ca62',
    '0x81fa6F9F4599c5316Cc53B782DE7c01EFf4f9551',
    '0x633e538EcF0bee1a18c2EDFE10C4Da0d6E71e77B',
    '0xac7D40638271D349cb2DeDfdC6268A77738403Fa',
    '0xFdb7D4AbD0109b36667946726dF943E83570286C',
    '0x7f0320cef62C88CE1DB7d77c1849082C053E2344',
    '0xC341c6a006cab105E8CD2518e25aaB311Cb22FF6',
    '0x74fdc215f8309Ec58Fd34455bf3Fee95FB3416dD',
    '0xc1d9Ead28Fc4CB9658C62594A695a53bfD306f77',
    '0xf92f12b505594EedF65CB8B973819dfA242c61D7',
    '0xFeED0bb79035c61CF6519795a02a6a2A69A11aAC',
    '0xD2220455E760Fb27ED8aaA6F9C7E143A687BB0aD',
    '0xBdd478cF8313240EfDC54108A2ed389d450cD702',

    // // qSAV - disabling these vaults because qubit was hacked and these tokens are no longer there
    // '0xDe80CE223C9f1D1db0BC8D5bDD88E03f6882eEA3',   // CAKE
    // '0x67c42b3dAC9526efCBFeeb2FC1C56Cf77F494e46',   // BNB
    // '0x4FC359E39A99acFDF44c794eF702fab93067B2A6',   // BUSD
    // '0x53fd20bc5D4d222764B70817810494F1D06f3403',   // USDT
    // '0x401c22395200Caaae87f8aB9f9446636Dde38c9A',   // DAI
    // '0xEe3Ee0BEb7919eDD31a4506d7d4C93940f2ACED6',   // USDC
    // '0xB9Cf0d36e82C2a1b46eD51e44dC0a4B0100D6d74',   // BTCB
    // '0x4b107b794c9Bbfd83E5Ac9E8Dd59F918510C5729',   // ETH
    // '0x33F93897e914a7482A262Ef10A94319840EB8D05',   // bQBT
    // '0xE6b3fb8E6c7B9d7fBf3BFD1a50ac8201c2fa5a8F',   // bQBT-BNB

    // vSAV v2
    '0xA555443A5eE77f334648eF4F557C0B5070fcb4de',
    '0xf70e331AcDDfC2a5cd169B8B3D1cC02951E8dE85',
    '0xa08a2664BD2124dD011224E1cb4fd6E263E3A208',
    '0x7cD22bd5B7a45F952a4f375AA6d5bf08538ed03C',
    '0x7d2De1362dc32c1974d3A7CBBbd6Ad898E7B3EE7',
]

const pots = [
    '0xa9b005d891414E0d6E0353490e099D0CA4C778Fc',
    '0xD601966588E812218a45f3ec06D3A89602348183'
]

const leveragedPools = [
    '0xfb8358f34133c275B0393E3883BDd8764Cb610DE',
    '0xD75f3E4e8ed51ec98ED57386Cb47DF457308Ad08',
    '0xb04D1A8266Ff97Ee9f48d48Ad2F2868b77F1C668',
    '0x12B7b4BEc740A7F438367ff3117253507eF605A7',
    '0xe0fB5Cd342BCA2229F413DA7a2684506b0397fF3',
    '0x8626Af388F0B69BB15C36422cE67f9638BA2B800'
]

const dashboardPolygon = '0xFA71FD547A6654b80c47DC0CE16EA46cECf93C02'
const poolsPolygon = [
    // polyBUNNY
    '0x10C8CFCa4953Bc554e71ddE3Fa19c335e163D7Ac',
    '0x7a526d4679cDe16641411cA813eAf7B33422501D',
    '0x6b86aB330F18E8FcC4FB214C91b1080577df3513',
    '0xe167Cf12a60f606C4C83bc34F09C4f9D9453690e',
    // qPool
    '0x4beB900C3a642c054CA57EfCA7090464082e904F',
    '0x54E1feE2182d0d96D0D8e592CbFd4debC8EEf7Df',
    '0x3cba7b58b4430794fa7a37F042bd54E3C2A351A8',
    '0x4964e4d8E17B86e15A2f0a4D8a43D8E4AbeC3E78',
    '0xf066208Fb16Dc1A06e31e104bEDb187468206a92',
    '0xB0621a46aFd14C0D1a1F8d3E1021C4aBCcd02F5b',
    '0x95aF402e9751f665617c3F9037f00f91ec00F7b6',
    '0x29270e0bb9bD89ce4febc2fBd72Cd7EB53C0aDD7',
    '0xE94096Fb06f60C7FC0d122A352154842384F80bd',
    '0x58918F94C14dD657f0745f8a5599190f5baDFa05',
    '0x4ee929E9b25d00E6C7FCAa513C01311Da40462F2',
    '0x560F866fE4e1E6EA20701B9dCc9555486E1B84c2',
    '0x470Be517cBd063265c1A519aE186ae82d10dD360',

    // sPool
    '0x87c743C1418864c9799FdE4C8612D1Ba64188ECe',
    '0x16CeE21c231E2c3cf2778Fe568230c145C8591cA',
    '0x45F10bAE59Ff9D4Be78eD20F0AAfDE532b254707',
    '0xdF0BE663C84322f55aD7b40A4120CdECBa4C4B45',
    '0x51C30ee94052baAABA60Db6b931c1f4657FFe174',
    '0x39D28Db6742a457BCfB927D4539bEea55Dc5Dd87',

]

const ZERO = new BigNumber(0)
const ETHER = new BigNumber(10).pow(18)

async function bsc(timestamp, ethBlock, chainBlock) {
    const block = chainBlock.bsc
    const total = (await sdk.api.abi.multiCall({
        calls: pools.map( address => ({
            target: dashboard,
            params: address
        })),
        block,
        abi: abi,
        chain: 'bsc'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)

    const pot_total = (await sdk.api.abi.multiCall({
        calls: pots.map( address => ({
            target: address
        })),
        block,
        abi: potABI,
        chain: 'bsc'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)

    const leverage_total = (await sdk.api.abi.multiCall({
        calls: leveragedPools.map( address => ({
            target: address
        })),
        block,
        abi: leverageABI,
        chain: 'bsc'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output[1])), ZERO)

    return {
        'tether': total.plus(pot_total).plus(leverage_total).dividedBy(ETHER).toNumber()
    }
}

async function polygon(timestamp, ethBlock, chainBlock) {
    const block = chainBlock.polygon
    const total = (await sdk.api.abi.multiCall({
        calls: poolsPolygon.map( address => ({
            target: dashboardPolygon,
            params: address
        })),
        block,
        abi: abi,
        chain: 'polygon'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)

    return {
        'tether': total.dividedBy(ETHER).toNumber()
    }
}


module.exports = {
    misrepresentedTokens: true,
    bsc:{
        tvl: bsc
    },
    polygon:{
        tvl:polygon
    },
    hallmarks: [
        [1621395248, 'Flash Loan Attack'],
    ],
}
