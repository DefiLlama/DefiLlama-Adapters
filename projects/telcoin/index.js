const { sumTokensAndLPs, sumBalancerLps } = require('../helper/unwrapLPs')

async function pool2(timestamp, ethBlock, chainBlocks) {
    const balances = {}
    await sumBalancerLps(balances, [
        ["0xd208168d2a512240eb82582205d94a0710bce4e7", "0xb967c3Fa919BB0a8f51cF40C60488b6EC9e8708B", true],  // Balancer (TEL/WMATIC/USDC)
        ["0x39cd55ff7e7d7c66d7d2736f1d5d4791cdab895b", "0x62eCa4D9Dbeac613ad86946b51A6225A1a0d14f4", true],  // Balancer (TEL/AAVE/USDC)
        ["0x5c6ee304399dbdb9c8ef030ab642b10820db8f56", "0x1e72c558a564B23b302bFd96c51dE41267bA26a9", true],  // Balancer (TEL/USDC 80:20)
        ["0xf099b7c3bd5a221aa34cb83004a50d66b0189ad0", "0x20Ed193cA4E36b2beBcad150089Fe3D99298d425", true],  // Balancer (TEL/WBTC/USDC)
        ["0xd5d7bc115b32ad1449c6d0083e43c87be95f2809", "0xefC6d17276C640169b352B37226949f5Eab35384", true],  // Balancer (TEL/WETH/USDC)
    ], chainBlocks.polygon, 'polygon', addr => `polygon:${addr}`)
    await sumTokensAndLPs(balances, [
        ["0xa5cabfc725dfa129f618d527e93702d10412f039", "0xbdb6a789d91815564981db3c7acb015e2577bc60", true],
        ["0xe88e24f49338f974b528ace10350ac4576c5c8a1", "0x51cfb74628c7484c9128d979650da2512947e532", true],
        ["0xfc2fc983a411c4b1e238f7eb949308cf0218c750", "0x09315f2577c2bccee0119790f706eb70dd67c2df", true],
        ["0x9b5c71936670e9f1f36e63f03384de7e06e60d2a", "0xdef7f3f6a940a9d2a01814b74b3e545dd364a02f", true],  //Quickswap TEL/WMATIC round 1
        ["0x4917bc6b8e705ad462ef525937e7eb7c6c87c356", "0x8e8def06290d25b999a1e5d90710e09c0b2b5280", true],  //Quickswap TEL/AAVE round 1
        ["0xaddc9c73f3cbad4e647eaff691715898825ac20c", "0x5c120f6e17130c38733b675125d74e4efc5b4425", true],  //Quickswap TEL/WBTC round 1
        ["0xe88e24f49338f974b528ace10350ac4576c5c8a1", "0xF8bdC7bC282847EeB5d4291ec79172B48526e9dE", true],  // Quickswap (QUICK/TEL) round 2
        ["0xfc2fc983a411c4b1e238f7eb949308cf0218c750", "0xEda437364DCF8AB00f07b49bCc213CDf356b3962", true],  // Quickswap (WETH/TEL) round 2
        ["0xa5cabfc725dfa129f618d527e93702d10412f039", "0x84B3c86D660D680847258Fd20aAA1274Cc35EAcd", true],  // Quickswap(USDC/TEL) round 2
    ], chainBlocks.polygon, 'polygon', addr => `polygon:${addr}`)
    return balances
}

async function tvl() {
    return {}
}

module.exports = {
    polygon: {
        pool2
    },
    tvl
}