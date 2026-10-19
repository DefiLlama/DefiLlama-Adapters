const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const basketCreatedAbiV1 = 'event BSKTCreated(string name, string symbol, address bskt, address bsktPair, address indexed creator, uint256 amount, uint256 _legacy, string _id, string description, uint256 feeAmount)';
const basketCreatedAbiV2 = 'event BSKTCreated(string name, string symbol, address bskt, address bsktPair, address indexed creator, uint256 amount, string _id, string description, uint256 feeAmount)';
const basketCreatedAbiV3 = 'event BSKTCreated(string name, string symbol, address bskt, address bsktPair, address indexed creator, uint256 amount, string basketId, string description)';

const CONFIG = {
    ethereum: {
        factory: '0xFca3732ca3b501b9B2971065d4B5AeB889B5563a',
        fromBlock: 23048185,
        alva: '0x8e729198d1C59B82bd6bBa579310C40d740A11C2'
    },
    base: {
        factory: '0x4B6eeD38E240D0869Efc10982824e77c7C31da3b',
        fromBlock: 44089906,
        alva: '0xCC68F95cf050E769D46d8d133Bf4193fCBb3f1Eb'
    }
}

async function getBsktPairs(api) {
    const cfg = CONFIG[api.chain]
    const [logsV1, logsV2, logsV3] = await Promise.all([
        getLogs2({ api, eventAbi: basketCreatedAbiV1, target: cfg.factory, fromBlock: cfg.fromBlock, extraKey: 'BSKTCreated-v1' }),
        getLogs2({ api, eventAbi: basketCreatedAbiV2, target: cfg.factory, fromBlock: cfg.fromBlock, extraKey: 'BSKTCreated-v2' }),
        getLogs2({ api, eventAbi: basketCreatedAbiV3, target: cfg.factory, fromBlock: cfg.fromBlock, extraKey: 'BSKTCreated-v3' }),
    ])
    return [...new Set([...logsV1, ...logsV2, ...logsV3].map(l => l.bsktPair))]
}

async function tvl(api) {
    const bsktPairs = await getBsktPairs(api)
    if (!bsktPairs.length) return

    const tokensPerPair = await api.multiCall({
        abi: 'function getTokenList() view returns (address[])',
        calls: bsktPairs.map(target => ({ target })),
        permitFailure: true,
    })

    const tokensAndOwners = []
    for (let i = 0; i < bsktPairs.length; i++) {
        for (const token of tokensPerPair[i] || []) {
            tokensAndOwners.push([token, bsktPairs[i]])
        }
    }
    return sumTokens2({ api, tokensAndOwners, blacklistedTokens: [CONFIG[api.chain].alva] })
}

async function staking(api) {
    const bsktPairs = await getBsktPairs(api)
    if (!bsktPairs.length) return
    return sumTokens2({ api, tokens: [CONFIG[api.chain].alva], owners: bsktPairs })
}

module.exports = {
    methodology: 'TVL counts the underlying tokens held in every Alvara basket pair contract deployed by the BSKT factories on each chain. ALVA tokens are reported under staking.',
    ethereum: { tvl, staking },
    base: { tvl, staking }
}
