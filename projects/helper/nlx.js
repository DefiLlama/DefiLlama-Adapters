const { getLogs } = require('../helper/cache/getLogs')

const defaultAbis = {
    allWhitelistedTokensLength: 'uint256:allWhitelistedTokensLength',
    allWhitelistedTokens: 'function allWhitelistedTokens(uint256) view returns (address)',
    EventLog1: "event EventLog1(address msgSender, string eventName, string indexed eventNameHash, bytes32 indexed topic1, tuple(tuple(tuple(string key, address value)[] items, tuple(string key, address[] value)[] arrayItems) addressItems, tuple(tuple(string key, uint256 value)[] items, tuple(string key, uint256[] value)[] arrayItems) uintItems, tuple(tuple(string key, int256 value)[] items, tuple(string key, int256[] value)[] arrayItems) intItems, tuple(tuple(string key, bool value)[] items, tuple(string key, bool[] value)[] arrayItems) boolItems, tuple(tuple(string key, bytes32 value)[] items, tuple(string key, bytes32[] value)[] arrayItems) bytes32Items, tuple(tuple(string key, bytes value)[] items, tuple(string key, bytes[] value)[] arrayItems) bytesItems, tuple(tuple(string key, string value)[] items, tuple(string key, string[] value)[] arrayItems) stringItems) eventData)",
}

function nlxExports({ eventEmitter, fromBlock, blacklistedTokens = [], abis = {} }) {
    // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/market/MarketFactory.sol#L87C19-L87C31
    // https://github.com/gmx-io/gmx-synthetics/tree/main/deployments/arbitrum
    const wxCore = "0x2c6bcf5990cc115984f0031d613af1a645089ad6"
    const wCore = "0x191e94fa59739e188dce837f7f6978d84727ad01"

    abis = { ...defaultAbis, ...abis }
    return async (api) => {
        const logs = await getLogs({
            api,
            target: eventEmitter,
            topics: ['0x137a44067c8961cd7e1d876f4754a5a3a75989b4552f1843fc69c3b372def160', '0xad5d762f1fc581b3e684cf095d93d3a2c10754f60124b09bec8bf3d76473baaf',], // need both else too many logs
            eventAbi: defaultAbis.EventLog1,
            onlyArgs: true,
            fromBlock,
        })

        const ownerTokens = logs.map(i => {
            let [market, index, long, short] = i[4].addressItems.items.map(i => i.value)
            return [[long, short,], market]
        })
        //wxcore not listed. so we need to map to wcore
        const tokenData = await api.sumTokens({ ownerTokens, blacklistedTokens, })

        if(tokenData[`${api.chain}:${wxCore}`]){
            tokenData[`${api.chain}:${wCore}`] = tokenData[`${api.chain}:${wxCore}`]
            delete tokenData[`${api.chain}:${wxCore}`]
        }

        return tokenData
    }
}

module.exports = {
    nlxExports,
}
