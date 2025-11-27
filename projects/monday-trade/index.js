const {sumTokens2} = require('../helper/unwrapLPs')
const {getLogs2,} = require('../helper/cache/getLogs')
const axios = require("axios");

const config = {
    monad: {
        gate: {
            address: '0x2e32345bf0592bff19313831b99900c530d37d90',
            fromBlock: 37430890
        },
        spotFactory: {
            address: '0xc1e98d0a2a58fb8abd10ccc30a58efff4080aa21',
            fromBlock: 35093818
        }
    },
}

const chainIds = {
    monad: 143,
}

async function getPerpTokens(api, chain) {
    const gateAddress = config[chain].gate.address
    const gateFromBlock = config[chain].gate.fromBlock
    // get all gate instruments
    const gateLogs = await getLogs2({
        api,
        target: gateAddress,
        fromBlock: gateFromBlock,
        eventAbi: 'event NewInstrument(bytes32 index, address instrument, address base, address quote, string symbol, uint total)',
    })
    const ownerTokens = gateLogs.map(i => ([[i.quote], i.instrument]))
    const allTokens = gateLogs.map(i => i.quote)
    ownerTokens.push([allTokens, gateAddress])
    return ownerTokens
}

// get all spot pools from onChain factory
// not use is because this error: failed to fetch data from s3 bucket: cache/logs/monad/0xc1e98d0a2a58fb8abd10ccc30a58efff4080aa21.json
async function getSpotTokens(api, chain) {
    const spotFactoryAddress = config[chain].spotFactory.address
    const spotFactoryFromBlock = config[chain].spotFactory.fromBlock
    const spotLogs = await getLogs2({
        api,
        target: spotFactoryAddress,
        fromBlock: spotFactoryFromBlock,
        eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
    })
    return spotLogs.map(i => ([[i.token0, i.token1], i.pool]))
}

async function getSpotTokensFromSubGraph(api, chain) {
    const res = await axios.get(`https://mainnet-api.monday.trade/spot/api/defi/llama/spot/address/${chainIds[chain]}`)
    return res.data
}

async function tvl(api, chain) {
    const ownerTokens = await getPerpTokens(api, chain)
    ownerTokens.push(...(await getSpotTokensFromSubGraph(api, chain)))
    console.log(ownerTokens)
    return sumTokens2({api, ownerTokens})
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        tvl: (api) => {
            return tvl(api, chain)
        }
    }
})