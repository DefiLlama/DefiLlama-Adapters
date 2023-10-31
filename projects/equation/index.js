const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require('../helper/cache/getLogs')


const config = {
    arbitrum: { factory: '0xA91680161fBCeA942e164B42445aD6130D01541F', stakingContract: '0x3C77EEB8eC4716a6389a522eD590FbbD261ABE8e', veEQU: '0x87AAfFdF26c6885f6010219208D5B161ec7609c0' },
}

Object.keys(config).forEach(chain => {
    const { factory, veEQU, stakingContract } = config[chain]
    module.exports[chain] = {
        methodology: "Count the tokens in different pools in the equation.",
        tvl: async (_, _b, _cb, { api, }) => {
            const logs = await getLogs({
                api,
                target: factory,
                topics: ['0x9c5d829b9b23efc461f9aeef91979ec04bb903feb3bee4f26d22114abfc7335b'],
                eventAbi: 'event PoolCreated(address indexed pool, address indexed token, address indexed usd)',
                onlyArgs: true,
                fromBlock: 142245092,
            })
            const ownerTokens = logs.map(i => [[i.usd], i.pool])
            return sumTokens2({ api, ownerTokens, })
        },
        staking: async (_, _a, _ca, { api, }) => {
            const logs = await getLogs({
                api,
                target: stakingContract,
                topics: ['0x7feea83a010526530fd5783cf6104983a7d4da95200fabede981f185b9305c9d'],
                eventAbi: 'event Staked(address indexed sender, address indexed account, uint256 indexed id, uint256 amount, uint16 period)',
                onlyArgs: true,
                fromBlock: 142245092,
            })
            const ownerTokens = logs.map(i => [[veEQU], i.account])
            return sumTokens2({ api, ownerTokens, })
        },
        pool2: async (_, _b, _cb, { api, }) => {
            const logs = await getLogs({
                api,
                target: stakingContract,
                topics: ['0x1dca4fbba1373d979ce5c2cca691dcbb941810336f0d01870865cc4139eb5d57'],
                eventAbi: 'event V3PosStaked(address indexed sender, address indexed account, uint256 indexed id, uint256 amount, uint16 period)',
                onlyArgs: true,
                fromBlock: 142245092,
            })
            const ownerTokens = logs.map(i => [[veEQU], i.account])
            return sumTokens2({ api, ownerTokens, })
        }
    }
})

