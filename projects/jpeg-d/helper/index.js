const sdk = require("@defillama/sdk");
const abi = require("./abis");
const { sumTokens } = require("../../helper/unwrapLPs");

// Treasury
const TREASURY = "0x51C2cEF9efa48e08557A361B52DB34061c025a1B";

// Tokens
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const TUSD = "0x0000000000085d4780B73119b644AE5ecd22b376";

// NFT pUSD vaults
const CRYPTO_PUNK_PUSD_VAULT = "0xD636a2fC1C18A54dB4442c3249D5e620cf8fE98F";
const ETHER_ROCKS_PUSD_VAULT = "0x6837a113aa7393ffbd5f7464e7313593cd2dd560";
const BAYC_PUSD_VAULT = "0x271c7603aaf2bd8f68e8ca60f4a4f22c4920259f";
const MAYC_PUSD_VAULT = "0x7b179f9bfbe50cfa401c1cdde3cb2c339c6635f3";
const DOODLES_PUSD_VAULT = "0x0a36f4bf39ed7d4718bd1b8dd759c19986ccd1a7";
const PUDGY_PENGUINS_PUSD_VAULT = "0xe793eaedc048b7441ed61b51acb5df107af996c2";
const AZUKI_PUSD_VAULT = "0x2acd96c8db23978a3dd32448a2477b132b4436e4";
const CLONEX_PUSD_VAULT = "0xc001f165f7d7542d22a1e82b4640512034a91c7d";
const AUTOGLYPH_PUSD_VAULT = "0xf42366f60ccc0f454b505fd72fb070e7f23b8171";
const FIDENZA_PUSD_VAULT = "0x64979eA0e4C7EB440402Fef273483ec8e74146d0";
const RINGERS_PUSD_VAULT = "0xa699e2f651861ec68e74fe01017ade75a12d5c1b";
const SQUIGGLES_PUSD_VAULT = "0x266d98307469f86f134ab884afefa98d3b4835b1";

// NFT pETH vaults
const CRYPTO_PUNK_PETH_VAULT = "0x4e5f305bfca77b17f804635a9ba669e187d51719";
const ETHER_ROCKS_PETH_VAULT = "0x7Bc8c4D106f084304d6c224F48AC02e6854C7AC5";
const BAYC_PETH_VAULT = "0xaf5e4c1bfac63e355cf093eea3d4aba138ea4089";
const MAYC_PETH_VAULT = "0xc45775baa4a6040414f3e199767033257a2a91b9";
const DOODLES_PETH_VAULT = "0x229e09d943a94c162a662ba0ffbcad21521b477a";
const PUDGY_PENGUINS_PETH_VAULT = "0x4b94b38bec611a2c93188949f017806c22097e9f";
const AZUKI_PETH_VAULT = "0x72695c2af4193029e0669f2c01d84b619d8c25e7";
const CLONEX_PETH_VAULT = "0x46db8fda0be00e8912bc28357d1e28e39bb404e2";
const AUTOGLYPH_PETH_VAULT = "0xCFd74e932B49eEf26f6527091821aDa8A9A4CbDa";
const FIDENZA_PETH_VAULT = "0x9C1DceD6C1668c4159cf71C41f54F0fb9C2Dc9Dc";
const RINGERS_PETH_VAULT = "0x9e208146a28a653f6212d2931f316932015a312b";
const SQUIGGLES_PETH_VAULT = "0x2a8d4e3bb2e09541bf5d79a1cf8b9dd2b3a1c6ab";

const VAULT_ARRAY = [
    // pUSD vaults
    CRYPTO_PUNK_PUSD_VAULT,
    BAYC_PUSD_VAULT,
    MAYC_PUSD_VAULT,
    DOODLES_PUSD_VAULT,
    PUDGY_PENGUINS_PUSD_VAULT,
    AZUKI_PUSD_VAULT,
    ETHER_ROCKS_PUSD_VAULT,
    CLONEX_PUSD_VAULT,
    AUTOGLYPH_PUSD_VAULT,
    FIDENZA_PUSD_VAULT,
    RINGERS_PUSD_VAULT,
    SQUIGGLES_PUSD_VAULT,
    // pETH vaults
    CRYPTO_PUNK_PETH_VAULT,
    BAYC_PETH_VAULT,
    MAYC_PETH_VAULT,
    DOODLES_PETH_VAULT,
    PUDGY_PENGUINS_PETH_VAULT,
    AZUKI_PETH_VAULT,
    ETHER_ROCKS_PETH_VAULT,
    CLONEX_PETH_VAULT,
    AUTOGLYPH_PETH_VAULT,
    FIDENZA_PETH_VAULT,
    RINGERS_PETH_VAULT,
    SQUIGGLES_PETH_VAULT,
];

async function getTVL(balances, chain, timestamp, chainBlocks) {
    // Fetch positions from vaults
    const { output: positions } = await sdk.api.abi.multiCall({
        calls: VAULT_ARRAY.map((address) => ({
            target: address,
        })),
        abi: abi.VAULT_ABI.totalPositions,
        block: chainBlocks[chain],
        chain,
    })

    const { output: valueProviders } = await sdk.api.abi.multiCall({
        calls: VAULT_ARRAY.map((address) => ({
            target: address,
        })),
        abi: abi.VAULT_ABI.nftValueProvider,
        block: chainBlocks[chain],
        chain,
    })

    // Fetch floor prices from price feeds set in the vaults
    const { output: floorPrices } = await sdk.api.abi.multiCall({
        calls: valueProviders.map((item) => ({
            target: item.output,
        })),
        abi: "uint256:getFloorETH",
        block: chainBlocks[chain],
        chain,
    })

    // Calculate total TVL in ETH terms
    let collateralValueETH = 0;
    for (let i = 0; i < positions.length; i++) {
        const floorPrice = floorPrices[i].output;
        const position = positions[i].output;
        collateralValueETH += position * floorPrice;
    }

    sdk.util.sumSingleBalance(balances, `${chain}:${WETH}`, collateralValueETH);
    return balances;
}

async function getTreasury(balances, chain, timestamp, chainBlocks) {
    await sumTokens(
        balances,
        [
            [WETH, TREASURY],
            [USDC, TREASURY],
            [DAI, TREASURY],
            [USDT, TREASURY],
            [TUSD, TREASURY],
        ],
        chainBlocks[chain]
    );

    return balances;
}

module.exports = {
    getTVL,
    getTreasury,
};
