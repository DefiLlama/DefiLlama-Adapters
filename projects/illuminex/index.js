const { getUniTVL } = require("../helper/unknownTokens");
const { stakingPricedLP } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const coreAssets = new Set([
    "0x1ffd8a218fdc5b38210d64cbb45f40dc55a4e019", // pROSE
    "0x9ca066f00e55b90623efe323feb2a649686538b6", // pUSDT,
    "0x8bc2b030b299964eefb5e1e0b36991352e56d2d3", // Raw wROSE
    "0x013e54bee29813bd786b24f9cb08f47c4b75955c", // pUSDC
    "0x3e4079ad76c83760e22b5c0105670ebab88b8d0e", // pbscUSDT
]);

const farmAssets = [
    "0xf0f7c4e8edb9edcbe200a4eaec384e8a48fc7815",
    "0xbf57d3efb74262eb8e7e44c375d7f9042836adb0",
    "0xf179d77c2b57d031409083a6b7e98f5bd460a485",
    "0x95833c537e85b810a9ff7ac71bdc60887742e594",
    "0x293f4a5d2e0cd6dd4247cc0cc1f8257436c7364a",
    "0xd6b9f83d55c889eebfd6c2dcf630da092293a17e",
    "0x5c48b49435f19562cb1472e93ef67bc5838ba7b8",
    "0xe32e1f619097152b42da753e106a24dd81bfa35a",
]

const stakingFarmingContractAddress = "0x494847e173D6CE28b6eF7a5596df6Bc7830175e1";
const ixToken = "0x08Fe02Da45720f754e6FCA338eC1286e860d2d2f";

const tvl = getUniTVL({
    factory: '0x045551B6A4066db850A1160B8bB7bD9Ce3A2B5A5',
    useDefaultCoreAssets: false,
    coreAssets,
});

module.exports = {
    methodology: "Counts liquidity on illumineX Exchange, as well as IX token single staking together with liquidity mining locked LP",
    misrepresentedTokens: true,
    timetravel: false,
    start: 1706475600,
    sapphire: {
        tvl,
        staking: stakingPricedLP(
            stakingFarmingContractAddress,
            ixToken,
            "sapphire",
            "0xf0f7c4e8edb9edcbe200a4eaec384e8a48fc7815",
            "oasis-network",
            true
        ),
        pool2: pool2(
            stakingFarmingContractAddress,
            farmAssets,
            "sapphire",
        )
    }
}