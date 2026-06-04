const ADDRESSES = require('../helper/coreAssets.json');

// AID.v0 token address (same on all chains: Ethereum, BNB Chain, Base, Arbitrum)
const AID_TOKEN = '0x18F52B3fb465118731d9e0d276d4Eb3599D57596';

const MIGRATION_CONTRACTS = {
    ethereum: '0x410c19f3f80b64c7486ae34890ee9251d0696433',
    arbitrum: '0x77b69A6bAE1360A176452B00F61A0Fc21C7EF333',
    base: '0xE2b908aa7C5DECBFC4260E52e138fc8d08272D03',
    bsc: '0x77b69A6bAE1360A176452B00F61A0Fc21C7EF333'
};

// Legacy AIDa (Alpha) pool contracts
const aidaContracts = {
    ethereum: [
        {
            token: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42', // AIDaUSDC token
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42' // AIDollarAlphaUSDC Pool
        },
        {
            token: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340', // AIDaUSDT token
            poolToken: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340' // AIDollarAlphaUSDT Pool
        },
        {
            token: '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
            poolToken: '0x5D976F56343e33A6a4d6e26AF7d59358d1359dd4' // AIDollarAlphaUSR Pool
        },
        {
            token: '0xaD55aebc9b8c03FC43cd9f62260391c13c23e7c0', // CUSDO
            poolToken: '0x17D02bCA29BD9E8cF4A39B25C9C902e6bF00AA54' // AIDollarAlphaCUSDO Pool
        }
    ],
    arbitrum: [
        {
            token: ADDRESSES.arbitrum.USDC_CIRCLE,
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42'
        },
        {
            token: ADDRESSES.arbitrum.USDT,
            poolToken: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340'
        }
    ],
    base: [
        {
            token: ADDRESSES.base.USDC,
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42'
        }
    ],
    sei: [
        {
            token: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392', // USDC
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42'
        },
        {
            token: '0x9151434b16b9763660705744891fA906F660EcC5', // USDT
            poolToken: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340'
        }
    ],
    sty: [
        {
            token: ADDRESSES.flow.stgUSDC, // USDC
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42'
        }
    ],
    bsc: [
        {
            token: ADDRESSES.bsc.USD1, // USD1
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42'
        },
        {
            token: ADDRESSES.bsc.USDT, // USDT
            poolToken: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340'
        }
    ]
};

const totalSupplyABI = "function totalSupply() external view returns (uint256)";
const totalAssetsABI = "function totalAssets() external view returns (uint256)";
const balanceOfABI = "function balanceOf(address) external view returns (uint256)";

// Legacy AIDa (Alpha) pool TVL
async function aidaTvl(api) {
    const chain = api.chain;
    const pools = aidaContracts[chain];
    if (!pools?.length) return api.getBalances();

    const poolAddrs = pools.map(p => p.poolToken);
    const migration = MIGRATION_CONTRACTS[chain];

    if (!migration) {
        const totalAssetsAmounts = await api.multiCall({ abi: totalAssetsABI, calls: poolAddrs });
        totalAssetsAmounts.forEach((amount, i) => api.add(pools[i].token, amount));
        return api.getBalances();
    }

    const [totalAssets, totalSupplies, migrationBals] = await Promise.all([
        api.multiCall({ abi: totalAssetsABI, calls: poolAddrs }),
        api.multiCall({ abi: totalSupplyABI, calls: poolAddrs }),
        api.multiCall({ abi: balanceOfABI, calls: poolAddrs.map(p => ({ target: p, params: migration })) }),
    ]);

    totalAssets.forEach((assets, i) => {
        const supply = BigInt(totalSupplies[i]);
        if (supply === 0n) return;
        const claimableShares = supply - BigInt(migrationBals[i]);
        const claimable = (BigInt(assets) * claimableShares) / supply;
        api.add(pools[i].token, claimable.toString());
    });

    return api.getBalances();
}

module.exports = {
    methodology: 'Tracks: 1) Legacy AIDa (Alpha) pool TVL using totalAssets(), 2) AID.v0 total supply across all chains.',
    start: 1715490671,
    timetravel: true,
    misrepresentedTokens: true,
    ethereum: {
        tvl: aidaTvl,
    },
    arbitrum: {
        tvl: aidaTvl,
    },
    base: {
        tvl: aidaTvl,
    },
    bsc: {
        tvl: aidaTvl,
    },
    sei: {
        tvl: aidaTvl,
    },
    sty: {
        tvl: aidaTvl,
    },
};