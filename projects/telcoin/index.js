const sdk = require('@defillama/sdk')
const {sumTokensAndLPs} = require('../helper/unwrapLPs')

async function pool2(timestamp, ethBlock, chainBlocks){
    const balances = {}
    await sumTokensAndLPs(balances, [
        ["0xa5cabfc725dfa129f618d527e93702d10412f039","0xbdb6a789d91815564981db3c7acb015e2577bc60", true],
        ["0xe88e24f49338f974b528ace10350ac4576c5c8a1", "0x51cfb74628c7484c9128d979650da2512947e532", true],
        ["0xfc2fc983a411c4b1e238f7eb949308cf0218c750", "0x09315f2577c2bccee0119790f706eb70dd67c2df", true],
        ["0x9b5c71936670e9f1f36e63f03384de7e06e60d2a", "0xdef7f3f6a940a9d2a01814b74b3e545dd364a02f", true],
        ["0x4917bc6b8e705ad462ef525937e7eb7c6c87c356", "0x8e8def06290d25b999a1e5d90710e09c0b2b5280", true],
        ["0xaddc9c73f3cbad4e647eaff691715898825ac20c", "0x5c120f6e17130c38733b675125d74e4efc5b4425", true]
    ], chainBlocks.polygon, 'polygon', addr=>`polygon:${addr}`)
    return balances
}

async function tvl(){
    return {}
}

module.exports={
    pool2:{
        tvl: pool2
    },
    tvl
}