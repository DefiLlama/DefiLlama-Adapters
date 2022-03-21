const { compoundExports } = require("./helper/compound");

function transformOasis(addr) {
    const map = {
        '0x21c718c22d52d0f3a789b752d4c2fd5908a8a733':'oasis-network',
        '0x3223f17957ba502cbe71401d55a0db26e5f7c68f':'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xdc19a122e268128b5ee20366299fc7b5b199c8e3':'0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xe8a638b3b7565ee7c5eb9755e58552afc87b94dd': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    }
    return map[addr.toLowerCase()] || `oasis:${addr}`

}
module.exports = {
    timetravel: true,
    aurora: {
        ...compoundExports(
            '0xA7684aE7e07Dac91113900342b3ef25B9Fd1D841',
            'oasis',
            '0xD7d588bAbFb99E82Cd6dd0cA7677A5599AA678B5',
            '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
            transformOasis
            )
    },
}; // node test.js projects/fountain.js