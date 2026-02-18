const ADDRESSES = require('../helper/coreAssets.json');

// AID.v0 token address (same on all chains: Ethereum, BNB Chain, Base, Arbitrum)
const AID_TOKEN = '0x18F52B3fb465118731d9e0d276d4Eb3599D57596';

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
            token: '0xF1815bd50389c46847f0Bda824eC8da914045D14', // USDC
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42'
        }
    ],
    bsc: [
        {
            token: '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d', // USD1
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42'
        },
        {
            token: '0x55d398326f99059ff775485246999027b3197955', // USDT
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

    if (pools && pools.length > 0) {
        const totalAssetsAmounts = await api.multiCall({
            abi: totalAssetsABI,
            calls: pools.map(p => p.poolToken),
        });

        totalAssetsAmounts.forEach((amount, index) => {
            api.add(pools[index].token, amount);
        });
    }

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