const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unwrapLPs')
const fundedContracts = [
    '0xefe0fed2b728b9711030e7643e98477957df9809', //TransparentUpgradeableProxy
    '0xd9184981bbab68e05eafd631dd2f8cbaf47e3e13'  //TransparentUpgradeableProxy
];
const stable = [
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.DAI,
    '0xa47c8bf37f92abed4a126bda807a7b7498661acd', //'wUST' : 
    ADDRESSES.ethereum.BUSD,
    ADDRESSES.ethereum.FRAX,
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