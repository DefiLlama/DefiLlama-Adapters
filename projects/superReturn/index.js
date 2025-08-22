const ADDRESSES = require('../helper/coreAssets.json')

// superUSD vault contract address are same in all chains
const SUPERUSD_CONTRACT = '0x15f3Ee2F609FBAe0bC48E3a071D66DD917C682EB';

const protocols = {
  ethereum: {
    euler: '0xe0a80d35bB6618CBA260120b279d357978c42BCE'
  },
  soneium: {
    sake: '0x5D7Af17B88Ad600EAb35957CC99eaa30D6330cFD',
    sakeProvider: '0x73a35ca19Da0357651296c40805c31585f19F741'
  },
  plume_mainnet: {
    morpho: ['0x0b14D0bdAf647c541d3887c5b1A4bd64068fCDA7']
  }
};

async function ethereumTvl(api) {
    // Euler Protocol
    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: protocols.ethereum.euler,
        params: [SUPERUSD_CONTRACT],
    });

    const previewShare = await api.call({
        abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
        target: protocols.ethereum.euler,
        params: [collateralBalance],
    });

    api.add(ADDRESSES.ethereum.USDC, previewShare);

    // Vault funds
    const vaultFunds = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.ethereum.USDC,
        params: [SUPERUSD_CONTRACT],
    });

    api.add(ADDRESSES.ethereum.USDC, vaultFunds);
}

async function soneiumTvl(api) {
    // Sake Protocol
    let [userReserves, ] = await api.call({
        abi: "function getUserReservesData(address provider, address user) view returns (tuple(address underlyingAsset, uint256 scaledATokenBalance, bool usageAsCollateralEnabledOnUser, uint256 stableBorrowRate, uint256 scaledVariableDebt, uint256 principalStableDebt, uint256 stableBorrowLastUpdateTimestamp)[], uint8)",
        target: protocols.soneium.sake,
        params: [protocols.soneium.sakeProvider, SUPERUSD_CONTRACT],
    });
    userReserves = userReserves.filter(reserve => reserve.scaledATokenBalance != 0);

    for (const reserve of userReserves) {
        const {
        underlyingAsset,
        scaledATokenBalance,
        } = reserve;

        api.add(ADDRESSES.soneium.USDC, scaledATokenBalance)
    }

    // Vault funds
    const vaultFunds = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.soneium.USDC,
        params: [SUPERUSD_CONTRACT],
    });

    api.add(ADDRESSES.soneium.USDC, vaultFunds);
}

async function plumeTvl(api) {
    // Morpho Protocol
    const morphoAddresses = protocols.plume_mainnet.morpho;
    
    const collateralBalances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: morphoAddresses.map(morphoAddress => ({
            target: morphoAddress,
            params: [SUPERUSD_CONTRACT]
        }))
    });

    const previewShares = await api.multiCall({
        abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
        calls: morphoAddresses.map((morphoAddress, i) => ({
            target: morphoAddress,
            params: [collateralBalances[i]]
        }))
    });

    previewShares.forEach(share => {
        api.add(ADDRESSES.plume_mainnet.pUSD, share);
    });

    // Vault funds
    const vaultFunds = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.plume_mainnet.pUSD,
        params: [SUPERUSD_CONTRACT],
    });

    api.add(ADDRESSES.plume_mainnet.pUSD, vaultFunds);
}

module.exports = {
  methodology: 'Tracks the deposits in yield-generating protocols',
  ethereum: { tvl: ethereumTvl },
  soneium: { tvl: soneiumTvl },
  plume_mainnet: { tvl: plumeTvl }
}; 