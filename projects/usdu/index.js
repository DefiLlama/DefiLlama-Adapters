const { parseEther } = require("ethers")

// morpho and stable
const morpho = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb'
const usduStable = '0xdde3ec717f220fc6a29d6a4be73f91da5b718e55'

// morpho related
const usduCoreVault = '0xce22b5fb17ccbc0c5d87dc2e0df47dd71e3adc0a'
const usduStakedVault = '0x0b5281e1fa7fc7c1f0890f311d5f04d55c0fd63c'
const usduMorphoAdapterV1 = '0x6D6525D8e234D840b2699f7107f14fa0D6C62c42' // set to expire
const usduMorphoAdapterV1_1 = '0xab6523Cd7fa669EC35Bd5358dF505382b810CDB5'

// curve pool
const usduCurveAdapterV1_USDC = '0x6f05782a28cDa7f01B054b014cF6cd92023937e4' // set to expire
const usduCurveAdapterV1_1_USDC = '0x77eBb1D7a7f5371a61b7D21D7734b6dDE6F0f94F'
const curveStableSwapNG_USDUUSDC = '0x771c91e699B4B23420de3F81dE2aA38C4041632b';

const fetch = async (api) => {
    const morpho1 = (await morphoAdapter(api, usduMorphoAdapterV1));
    const morpho1_1 = (await morphoAdapter(api, usduMorphoAdapterV1_1));
    
    const curve1 = (await curveAdapter(api, usduCurveAdapterV1_USDC, curveStableSwapNG_USDUUSDC));
    const curve1_1 = (await curveAdapter(api, usduCurveAdapterV1_1_USDC, curveStableSwapNG_USDUUSDC));

    api.add(usduStable, morpho1.totalAssets);
    api.add(usduStable, morpho1_1.totalAssets);
    api.add(usduStable, curve1.totalAssets);
    api.add(usduStable, curve1_1.totalAssets);
    return api.getBalances();
}

// MORPHO ADAPTERS
const morphoAdapter = async (api, adapter) => {
    // ASSETS
    const totalAssets = await api.call({
        target: adapter,
        abi: 'function totalAssets() view returns (uint256)',
    });

    // LIABILITIES
    const totalMinted = await api.call({
        target: adapter,
        abi: 'function totalMinted() view returns (uint256)',
    });

    return { totalAssets, totalMinted };
}

// CURVE ADAPTERS
const curveAdapter = async (api, adapter, pool) => {
    // ASSETS
    const virtualPrice = await api.call({
        target: pool,
        abi: 'function get_virtual_price() view returns (uint256)',
    });
    const priceOfOneToken = await api.call({
        target: pool,
        abi: 'function get_dy(int128,int128,uint256) view returns (uint256)',
        params: [1, 0, 1000000]
    });

    const lpPrice = (BigInt(virtualPrice) * BigInt(priceOfOneToken)) / parseEther('1');
    
    const totalBalance = await api.call({
        target: pool,
        abi: 'function balanceOf(address) view returns (uint256)',
        params: [adapter]
    });

    const totalAssets = (BigInt(totalBalance) * BigInt(lpPrice)) / parseEther('1');
    

    // LIABILITIES
    const totalMinted = await api.call({
        target: adapter,
        abi: 'function totalMinted() view returns (uint256)',
    });

    return { totalAssets, totalMinted };
}

module.exports = {
    methodology: "TVL represents the backing value of all minting modules/adapters (morpho, curve, ...)",
    ethereum: {
      tvl: fetch,
      start: '2025-07-04',
      timetravel: true,
    },
  };