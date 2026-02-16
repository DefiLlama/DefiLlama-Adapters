const {getLogs2, getAddress,} = require('../helper/cache/getLogs');
const {sumTokens2} = require('../helper/unwrapLPs');


async function tvl(api) {
    const {factory, fromBlock, optionsTrade} = config[api.chain]
    const privateLogs = await getLogs2({
        api,
        factory,
        fromBlock,
        extraKey: 'private-pool',
        topics: ['0x321e5276dc2982b3e95825088a15cf891d1f691c70b6236b506afa3810ec0297']
    })
    const publicLogs = await getLogs2({
        api,
        factory,
        fromBlock,
        extraKey: 'public-pool',
        topics: ['0x53aad570e9fba02f275a68e410f634e241c8301d036a94761d71bcba65941a36']
    })
    const logs = privateLogs.concat(publicLogs)
    const ownerTokens = []
    const allTokens = []
    logs.forEach(({topics}) => {
        const token = getAddress(topics[2])
        const pool = getAddress(topics[3])
        ownerTokens.push([[token], pool])
        allTokens.push(token)
    })
    ownerTokens.push([allTokens, optionsTrade])
    return sumTokens2({api, ownerTokens, permitFailure: true})
}

module.exports = {
    methodology: "The world's first decentralized currency standard Perpetual options Transaction agreement",
};

const config = {
    bsc: {
        factory: '0x88f29D34c9602130B21Be4E1EaBEB7797177f259',
        fromBlock: 46616446,
        optionsTrade: '0x4e10384e98F2f170E00bfB1C3363D6f108a9ee68'
    },
    acala:{
        factory: '0xec676347105e7e898e0d8e24f524989cbff23d55',
        fromBlock: 7253471,
        optionsTrade: '0x5e413ed5e35506488779c5188ea58628955c83b8'
    },
    // bitlayer:{
    //     factory: '0xb711ba37fa74b99e70c27e82def0b15a50ac7a9e',
    //     fromBlock: 4328431,
    //     optionsTrade: '0x482390a90a49d17d119f5c7dfe5e5bedb149fd9d'
    // },
    op_bnb:{
        factory: '0x91ABFdd51c0959016c54AbDfb012E81Ef82008d1',
        fromBlock: 51301555,
        optionsTrade: '0x91e644C8Fd5d5B799e0D238F31D9b46a91b8Ca03'
    },
    // aia:{
    //     factory: '0x0e1e15b77de5924650da76f9e1ae46b07f493aec',
    //     fromBlock: 34771150,
    //     optionsTrade: '0x599bcd62cfa06c7e566da0ce62b376d0359d4a24'
    // },
    base:{
        factory: '0x344d02cEBb36ABBA6e55A9cefC703A75cA09E4E0',
        fromBlock: 28996468,
        optionsTrade: '0x43F323AcA25b57182bDc87564410ea7056975265'
    },
    // avalanche:{
    //     factory: '0x5874ee8e6e96bFB17212962537e5Bf359630a268',
    //     fromBlock: 	57296254,
    //     optionsTrade: '0x344d02cEBb36ABBA6e55A9cefC703A75cA09E4E0'
    // },
    conflux:{
        factory: '0xdc8091d097ca47afbbcc1ec216f3c5c26c587d19',
        fromBlock: 117895905,
        optionsTrade: '0x34bfe094c1275026475d37df3bb63a8d0adbc558'
    }
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {tvl}
})
