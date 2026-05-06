const YOUSD = '0x0000000f2eB9f69274678c76222B35eEc7588a65'
const ALCHEMIST_CS = '0x87428d886F43068A44d7bDEeF106D3c42E1d6f23'

const vaults = {
    base: [
        '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
        '0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC',
        '0x50c749aE210D3977ADC824AE11F3c7fd10c871e9'
    ],
    ethereum: [
        '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
        '0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC',
        '0x50c749aE210D3977ADC824AE11F3c7fd10c871e9',
        '0x586675A3a46B008d8408933cf42d8ff6c9CC61a1'
    ],
    arbitrum: []
}

async function tvl(api) {
    await api.erc4626Sum2({ calls: [...vaults[api.chain], YOUSD] });
}

async function ethereumTvl(api) {
    await tvl(api);
    // Subtract AlchemistCS's yoUSD position to prevent double counting
    // yoGOLD -> AlchemistCS -> yoUSD
    const shares = await api.call({ abi: 'erc20:balanceOf', target: YOUSD, params: ALCHEMIST_CS })
    const assets = await api.call({ abi: 'function convertToAssets(uint256) view returns (uint256)', target: YOUSD, params: shares })
    const asset = await api.call({ abi: 'address:asset', target: YOUSD })
    api.add(asset, -assets)
}

module.exports = {
    methodology: "We calculate TVL based on the Total Assets of each vault contract on each chain where users can deposit into YO vaults",
    doublecounted: true,
    base: { tvl },
    ethereum: { tvl: ethereumTvl },
    arbitrum: { tvl },
};