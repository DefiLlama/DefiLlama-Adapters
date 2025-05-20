/**
 * Haven1 adapter for DefiLlama.
 *
 * Tracks total value locked (TVL) from:
 * - DEX liquidity;
 * - Flexible Staking;
 * - Voting Escrow.
 *
 * Additionally, tracks currently vesting H1.
 *
 * Note: Both Flexible Staking and Voting Escrow support deposits of multiple
 * H1 variants (1:1 pegged). One such variant, Escrow H1 (esH1), is only
 * transferable between users and the staking contracts, and does not have a
 * market price on the DEX. Therefore, for valuation purposes, esH1 is treated
 * as equivalent to wH1.
 */

// -----------------------------------------------------------------------------
// Imports

const { uniV3Export } = require("../helper/uniswapV3");
const {
    haven1: { WH1 },
} = require("../helper/coreAssets.json");

// -----------------------------------------------------------------------------
// Constants

const ABI = {
    totalSupply: "uint256:totalSupply",
    supply: "uint256:supply",
    balanceOf: "function balanceOf(address account) view returns (uint256)",
};

const DEX = {
    factory: "0xEf3D1d7d3B10Ff716b1b22C9536bd22Dd0fE60ab",
    fromBlock: 13273,
};

const STAKING = {
    flex: "0x708E6dd0452D2C245e7d461c6c8B70F587ca3167",
    ve: "0xac488B7E18Cef83aC300E9ffD9324BAa5BB62a13",
};

const STAKING_CONFIG = [
    { abi: ABI.totalSupply, target: STAKING.flex },
    { abi: ABI.supply, target: STAKING.ve },
];

const VESTING = [
    "0x082a8510207F32Ff77a382693099738971Cc3116",
    "0xCbe5524F1D2c27FCB8DE3459FE22c07e41bd7020",
    "0x7ca74DD1C8639b907D462330a491bc950a2ca27B",
    "0x9B8CC775B021173b7B33CB03ac70DF6822D55c87",
    "0xB57Eb63F41AF6f8353ad68B55037f833975De407",
    "0x11EB7042F155F0A9490C44594cE4aD39aF76E44b",
    "0x3ca1323c8A07a5B7Af825eB60eE247A784C471cE",
    "0x0D75c5DaA3a4BF52dA23C146BF8631faBD1A0D64",
    "0xf3335F316E038150065057bCa19c2180CdfeDbf2",
    "0xFCF78447ac98ee611367692D36fC9b053c684E7f",
    "0xD5415fc7fFfc5d5ad7bB29E948276c1Ee5F1CEA0",
    "0x3Ca451F30f46A0d5cCBc7ba5e1661d69B2c5ED5B",
    "0x6e608C8f7a9543E54Ea3A39df0b702bcdA89896E",
    "0xdA29bacE9Be56Eb8994300cE39A4535B2dC76bed",
    "0x246B2cf745D03026d8c6Bab6bFf552c9Ac53CD4D",
    "0xadc31F1D239094A2731E0F2FcF912Cb5A2499F34",
    "0xFB97d9E72BBea40F00e456db8F981667Eafde276",
];

const VESTING_CALLS = VESTING.map(addr => {
    return { target: WH1, params: [addr] };
});

// -----------------------------------------------------------------------------
// TVL

const dexTVL = uniV3Export({
    haven1: { factory: DEX.factory, fromBlock: DEX.fromBlock },
});

async function staking(api) {
    const balances = await Promise.all(STAKING_CONFIG.map(cfg => api.call(cfg)));
    api.add(WH1, balances);
}

async function vesting(api) {
    const result = await api.multiCall({
        abi: ABI.balanceOf,
        calls: VESTING_CALLS,
        permitFailure: true,
    });

    api.add(WH1, result);
}

// -----------------------------------------------------------------------------
// Exports

module.exports = {
    methodology:
        "TVL includes DEX liquidity, tokens staked in flexible and voting escrow contracts, and tokens vesting.",
    haven1: {
        tvl: dexTVL.haven1.tvl,
        staking,
        vesting,
    },
};
