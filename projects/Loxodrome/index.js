// const MINT_TOKEN_CONTRACT = '0xE18568f86dA705F8Ee9f89fA87162216739BDC56';
// const MINT_LOXO_BOND_CONTRACT = '0x11d822ff840e2ec115589c73c629b3109e49a447';
// // 0x7812523F7E7C3d415675810a5FF6ec156C5a6564
// // 0x92bfa051BF12A0AEf9a5E1AC8b2AA7DC1B05a406
// // 0xE18568f86dA705F8Ee9f89fA87162216739BDC56
// async function tvl(api) {
//     const collateralBalance = await api.call({
//         abi: 'erc20:balanceOf',
//         target: '0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1',
//         params: ['0x11d822ff840e2ec115589c73c629b3109e49a447'],
//     });

//     api.add('0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1', collateralBalance)
//     const collateralBalance2 = await api.call({
//         abi: 'erc20:balanceOf',
//         target: '0xa00744882684c3e4747faefd68d283ea44099d03',
//         params: ['0x11d822ff840e2ec115589c73c629b3109e49a447'],
//     });

//     api.add('0xa00744882684c3e4747faefd68d283ea44099d03', collateralBalance2)
// }

// module.exports = {
//     methodology: 'counts the number of MINT tokens in the LOXO Bonding contract.',
//     iotex: {
//         tvl
//     }
// };
const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')
const owner = '0x11d822ff840e2ec115589c73c629b3109e49a447'
const chain = 'iotex'
const balances = {}
const toa = [
    [ADDRESSES.iotex.ioUSDT, owner],
    [ADDRESSES.iotex.WIOTX, owner],
    ['0x6c0bf4b53696b5434a0d21c7d13aa3cbf754913e', '0x1f9746364718eac05c9dde3eecb2798003ae6cfd'], //WEN/WIOTX
    [ADDRESSES.iotex.WIOTX, '0x1f9746364718eac05c9dde3eecb2798003ae6cfd'],
    [ADDRESSES.iotex.ioETH, '0x392e39084c6c67ab9e916c8644cee8434c1c092f'],
    [ADDRESSES.iotex.WIOTX, '0x392e39084c6c67ab9e916c8644cee8434c1c092f'],
    [ADDRESSES.iotex.ioUSDC, '0xbf52ae7ecfcc56d16605cc5c0a14325964da26da'],
    [ADDRESSES.iotex.WIOTX, '0xbf52ae7ecfcc56d16605cc5c0a14325964da26da'],
    [ADDRESSES.iotex.GFT, '0xd39dcfe05b8c0529587a11bedbd33158f754eef4'],
    [ADDRESSES.iotex.WIOTX, '0xd39dcfe05b8c0529587a11bedbd33158f754eef4'],
    ['0x1ae24d4928a86faaacd71cf414d2b3a499adb29b', '0xe28c3f8afdd68dbb5aa156242ece76b0f8887f29'], //DATA/WIOTX
    [ADDRESSES.iotex.WIOTX, '0xe28c3f8afdd68dbb5aa156242ece76b0f8887f29'],
    ['0x236f8c0a61da474db21b693fb2ea7aab0c803894', '0xe2d2b0b05b27c7a24e09afdc9f969d969189be78'], //uniIOTX/WIOTX
    [ADDRESSES.iotex.WIOTX, '0xe2d2b0b05b27c7a24e09afdc9f969d969189be78'],

    ['0x2465f4fe55454d2866221d5e9305f61a20cdc6e1', '0xe2d2b0b05b27c7a24e09afdc9f969d969189be78'],
    ['0x6044e0ed178d7b6e5638428ca16d15df3f7aa42d', '0x11d822ff840e2ec115589c73c629b3109e49a447'],
    ['0xbef57caba3e3b5ddfb6a9cc5045eaf54297a607e', '0x392e39084c6c67ab9e916c8644cee8434c1c092f'],
    ['0xce7577ccff8ef536b2dbb000eaa2af457307b065', '0x1f9746364718eac05c9dde3eecb2798003ae6cfd'],
    ['0xe50c49e3747892c421850a8c34bd371ca9085f76', '0xbf52ae7ecfcc56d16605cc5c0a14325964da26da'],
    ['0xf3e053b66bd1bb3e0f939b51650ce6a4586991a1', '0xd39dcfe05b8c0529587a11bedbd33158f754eef4'],
]
module.exports = {
    iotex: {
        tvl: sumTokensExport({ balances,tokensAndOwners: toa,resolveLP:true })
    }
}