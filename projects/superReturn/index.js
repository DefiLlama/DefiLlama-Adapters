const ADDRESSES = require('../helper/coreAssets.json')

// superUSD vault contract address are same in all chains
const SUPERUSD_CONTRACT = '0x15f3Ee2F609FBAe0bC48E3a071D66DD917C682EB';

const protocols = {
  ethereum: {
    euler: ['0xe0a80d35bB6618CBA260120b279d357978c42BCE' , '0x53afe3343f322c4189ab69e0d048efd154259419']
  },
  soneium: {
    sake: '0x5D7Af17B88Ad600EAb35957CC99eaa30D6330cFD',
    sakeProvider: '0x73a35ca19Da0357651296c40805c31585f19F741'
  },
  plume_mainnet: {
    morpho: ['0x0b14D0bdAf647c541d3887c5b1A4bd64068fCDA7', '0xc0Df5784f28046D11813356919B869dDA5815B16']
  },
  arbitrum: {
    morpho: [
        '0x4B6F1C9E5d470b97181786b26da0d0945A7cf027',
        '0x5c0C306Aaa9F877de636f4d5822cA9F2E81563BA',
        '0x7c574174DA4b2be3f705c6244B4BfA0815a8B3Ed',
        '0x7e97fa6893871A2751B5fE961978DCCb2c201E65',
        '0x36b69949d60d06ECcC14DE0Ae63f4E00cc2cd8B9',
        '0x64A651D825FC70Ebba88f2E1BAD90be9A496C4b9',
        '0x704761B6280BfABC7E397EfD34Fc15cd3b527d7D',
        '0x87DEAE530841A9671326C9D5B9f91bdB11F3162c',
        '0x9257eDDa03f9915857187e927eF501c53b1679b3',
        '0xa53Cf822FE93002aEaE16d395CD823Ece161a6AC',
        '0xa60643c90A542A95026C0F1dbdB0615fF42019Cf',
        '0x250CF7c82bAc7cB6cf899b6052979d4B5BA1f9ca'
    ]
  }
};

async function ethereumTvl(api) {
    // Euler Protocol
    const eulerAddresses = protocols.ethereum.euler;
    
    const collateralBalances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: eulerAddresses.map(eulerAddress => ({
            target: eulerAddress,
            params: [SUPERUSD_CONTRACT]
        }))
    });

    const previewShares = await api.multiCall({
        abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
        calls: eulerAddresses.map((eulerAddress, i) => ({
            target: eulerAddress,
            params: [collateralBalances[i]]
        }))
    });

    previewShares.forEach(share => {
        api.add(ADDRESSES.ethereum.USDC, share);
    });

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

async function arbitrumTvl(api) {
    // Morpho Protocol
    const morphoAddresses = protocols.arbitrum.morpho;
    
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
        api.add(ADDRESSES.arbitrum.USDC, share);
    });

    // Vault funds
    const vaultFunds = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.arbitrum.USDC,
        params: [SUPERUSD_CONTRACT],
    });

    api.add(ADDRESSES.arbitrum.USDC, vaultFunds);
}

module.exports = {
  methodology: 'Tracks the deposits in yield-generating protocols',
  ethereum: { tvl: ethereumTvl },
  soneium: { tvl: soneiumTvl },
  plume_mainnet: { tvl: plumeTvl },
  arbitrum: { tvl: arbitrumTvl }
}; 