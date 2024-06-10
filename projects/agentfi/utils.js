const { collection, agentRegistry } = require("./ca");

async function getAllAgent(api) {
    const [genesisTotalSupply, explorerTotalSupply, strategyTotalSupply] = await api.multiCall({
        abi: 'uint256:totalSupply', calls: [collection.genesis, collection.explorer, collection.strategy]
    })
    const genesisCalls = Array.from({ length: genesisTotalSupply }, (_, i) => i).map(i => ({
        target: agentRegistry, params: [collection.genesis, i + 1]
    }))
    const explorerCalls = Array.from({ length: explorerTotalSupply }, (_, i) => i).map(i => ({
        target: agentRegistry, params: [collection.explorer, i + 1]
    }))
    const strategyCalls = Array.from({ length: strategyTotalSupply }, (_, i) => i).map(i => ({
        target: agentRegistry, params: [collection.strategy, i + 1]
    }))


    const rootAgentAddressPromise = api.multiCall({
        permitFailure: true,
        abi: "function getTbasOfNft(address collection, uint256 agentID) view returns (tuple(address agentAddress, address implementationAddress)[] tbas)",
        calls: [...genesisCalls, ...explorerCalls],
        requery: true,
    })
    const strategyAgentAddressPromise = api.multiCall({
        permitFailure: true,
        abi: "function getTbasOfNft(address collection, uint256 agentID) view returns (tuple(address agentAddress, address implementationAddress)[] tbas)",
        calls: strategyCalls,
        requery: true,
    })

    const [rootAgentAddresses, strategyAgentAddresses] = await Promise.all([rootAgentAddressPromise, strategyAgentAddressPromise])

    const moduleCall = strategyAgentAddresses.map(i => i[0].agentAddress).map(i => ({
        target: i, params: ['0x82ccd330']
    }))
    const moduleCall2 = strategyAgentAddresses.map(i => i[0].agentAddress).map(i => ({
        target: i, params: ['0x7bb485dc']
    }))
    const modulePromise = api.multiCall({
        permitFailure: true,
        abi: "function overrides(bytes4) view returns (address implementation, bool isProtected)",
        calls: moduleCall,
        withMetadata: true,
        requery: true,
    })
    const module2Promise = api.multiCall({
        permitFailure: true,
        abi: "function overrides(bytes4) view returns (address implementation, bool isProtected)",
        calls: moduleCall2,
        withMetadata: true,
        requery: true,
    })
    const moduleResult = await Promise.all([modulePromise, module2Promise])
    const allAgentAddress = [...rootAgentAddresses, ...strategyAgentAddresses].map(i => ({
        agentAddress: i[0].agentAddress,
        implementationAddress: i[0].implementationAddress,
    }))

    const addressWithModuleType = allAgentAddress.map((i) => {
        const agentAddress = i.agentAddress
        const modules = moduleResult.flat().filter(x => x.success).filter(j => j.input.target === agentAddress).map(j => j.output[0])
        const DexBalancerModules = ["0x7e8280f5Ee5137f89d09FA61B356fa322a93415a", "0x35a4B9B95bc1D93Bf8e3CA9c030fc15726b83E6F", "0x067299A9C3F7E8d4A9d9dD06E2C1Fe3240144389"]
        const MultioliooorModule = ["0x54D588243976F7fA4eaf68d77122Da4e6C811167"]
        const ConcentratedLiquidityModule = ["0x10C02a975a748Db5B749Dc420154dD945e2e8657", "0x41D68d86545D6b931c1232f1E0aBB5844Ada4967", "0xa11D4dcD5a9ad75c609E1786cf1FD88b53C83A5E"]
        const Looper = ["0x6A9D21A09A76808C444a89fE5fCc0a5f38dc0523", "0xe5fe6f280CEadc5c4DDE69eF2DF6234dd7Bd82E2"]
        if (modules.some(i => DexBalancerModules.includes(i))) {
            return {
                ...i,
                moduleType: "DexBalancer"
            }
        } else if (modules.some(i => MultioliooorModule.includes(i))) {
            return {
                ...i,
                moduleType: "Multipliooor"
            }
        } else if (modules.some(i => ConcentratedLiquidityModule.includes(i))) {
            return {
                ...i,
                moduleType: "ConcentratedLiquidity"
            }
        } else if (modules.some(i => Looper.includes(i))) {
            return {
                ...i,
                moduleType: "Looper"
            }
        } else {
            return {
                ...i,
                moduleType: "Unknown"
            }
        }
    })

    return addressWithModuleType
}

module.exports = {
    getAllAgent
}
