const config = require("./config");
const { getLogs } = require('../helper/cache/getLogs');

const abi = {
    getAccountantState: 'function getAccountantState() view returns (tuple(address payoutAddress, uint96 exchangeRate, uint128 feesOwedInBase, uint128 totalSharesLastUpdate, uint64 lastUpdateTimestamp, uint16 platformFee))',
    eventBridgeExecuted: 'event BridgeExecuted(address indexed sender, address indexed receiver, address token, uint256 amount, uint256 timestamp)'
}

const crossChain = {
    ethereum: { executor: '0xb2f865041e3F7De4576FB5B30ac8e9fbDA82e29d', fromBlock: 24090329 },
    arbitrum: { executor: '0xb2f865041e3F7De4576FB5B30ac8e9fbDA82e29d', fromBlock: 414382638 },
    bsc: { executor: '0x6b5a6B402F984FCd4175C43b642800920873cbC5', fromBlock: 74944045 },
    core: { executor: '0xb2f865041e3F7De4576FB5B30ac8e9fbDA82e29d', fromBlock: 31251416 }
}

async function coreTvl(api) {
    const contracts =Object.values(config.vaults)

    const supplies = await api.multiCall({
        abi: "erc20:totalSupply",
        calls: contracts.map((c) => ({target: c.BoringVaultAddress})),
    })
    const decimals = await api.multiCall({
        abi: "erc20:decimals",
        calls: contracts.map((c) => ({target: c.BoringVaultAddress})),
    })
    const accountants = await api.multiCall({
        abi: abi.getAccountantState,
        calls: contracts.map((c) => ({target: c.AccountantAddress})),
    })

    contracts.forEach((c, index) => {
        const shares = supplies[index]
        const decimal = decimals[index]
        const exchangeRate = accountants[index].exchangeRate

        const assetSupply = (shares * exchangeRate) / (10 ** decimal)

        api.add(c.StakingToken, assetSupply)
    })
}

async function crossTvl(api, executor, fromBlock) {
    const logs = await getLogs({
        api,
        target: executor,
        eventAbi: abi.eventBridgeExecuted,
        onlyArgs: true,
        fromBlock,
    })
    logs.forEach((log) => {
        api.add(log.token, log.amount)
    })
}

module.exports = {
    berachain: {
        tvl: coreTvl
    },
}

Object.keys(crossChain).forEach(chain => {
    module.exports[chain] = {
        tvl: (api) => crossTvl(api, crossChain[chain].executor, crossChain[chain].fromBlock)
    }
})