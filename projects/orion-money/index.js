const { sumTokensExport, } = require('../helper/unwrapLPs')
const fundedContracts = [
    '0xefe0fed2b728b9711030e7643e98477957df9809', //TransparentUpgradeableProxy
    '0xd9184981bbab68e05eafd631dd2f8cbaf47e3e13'  //TransparentUpgradeableProxy
];
const stable = [
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //'USDC' : 
    '0xdac17f958d2ee523a2206206994597c13d831ec7', //'USDT' : 
    '0x6b175474e89094c44da98b954eedeac495271d0f', //'DAI' : 
    '0xa47c8bf37f92abed4a126bda807a7b7498661acd', //'wUST' : 
    '0x4fabb145d64652a948d72533023f6e7a623c7c53', //'BUSD' : 
    '0x853d955acef822db058eb8505911ed77f175b99e' //'FRAX' : 
];
const anchor = [
    '0x94eAd8f528A3aF425de14cfdDA727B218915687C', //'aUSDC': 
    '0x54E076dBa023251854f4C29ea750566528734B2d', //'aUSDT': 
    '0x23afFce94d2A6736DE456a25eB8Cc96612Ca55CA', //'aDAI':
    '0xaaf85bcfebd49a9e2cacda02f7fc1bbc3db7b2e0', //'vaUST':
    '0x5a6a33117ecbc6ea38b3a140f3e20245052cc647', //'aBUSD':
    '0x0660ae7b180e584d05890e56be3a372f0b746515', //'aFRAX':
];

module.exports = {
    ethereum: {
        tvl: sumTokensExport({ tokens: [...stable, ...anchor], owners: fundedContracts}),
    },
    methodology: "counts the value of each stablecoin, and interest-bearing anchor-stable, in the TransparentUpgradeableProxy contracts.",
};