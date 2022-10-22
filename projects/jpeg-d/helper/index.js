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

// NFT pETH vaults
const CRYPTO_PUNK_PETH_VAULT = "0x4e5f305bfca77b17f804635a9ba669e187d51719";
const BAYC_PETH_VAULT = "0xaf5e4c1bfac63e355cf093eea3d4aba138ea4089";
const MAYC_PETH_VAULT = "0xc45775baa4a6040414f3e199767033257a2a91b9";
const DOODLES_PETH_VAULT = "0x229e09d943a94c162a662ba0ffbcad21521b477a";

const NFT_CHAINLINKED_ARRAY = [
    CRYPTO_PUNK_PUSD_VAULT,
    BAYC_PUSD_VAULT,
    MAYC_PUSD_VAULT,
    DOODLES_PUSD_VAULT,
    ETHER_ROCKS_PUSD_VAULT,
    CRYPTO_PUNK_PETH_VAULT,
    BAYC_PETH_VAULT,
    MAYC_PETH_VAULT,
    DOODLES_PETH_VAULT,
];

const NFT_DAO_SET_ARRAY = [
];


async function getTVL(balances, chain, timestamp, chainBlocks) {
    // Fetch positions and oracles from vaults
    const { output: totalChainlinkedPositions } = await sdk.api.abi.multiCall({
        calls: NFT_CHAINLINKED_ARRAY.map((address) => ({
            target: address,
        })),
        abi: abi.VAULT_ABI.find(
            (a) => a.name === "totalPositions"
        ),
        block: chainBlocks[chain],
        chain,
    })

    const { output: floorPrices } = await sdk.api.abi.multiCall({
        calls: NFT_CHAINLINKED_ARRAY.map((address, i) => ({
            target: address, params: totalChainlinkedPositions[i].output > 0 ? totalChainlinkedPositions[i].output - 1 : 0
        })),
        abi: {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_nftIndex",
                    "type": "uint256"
                }
            ],
            "name": "getNFTValueETH",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        block: chainBlocks[chain],
        chain,
    })


    let collateralValueETH = 0;
    for (let i = 0; i < totalChainlinkedPositions.length; i++) {
        const floorPrice = floorPrices[i].output;
        const position = totalChainlinkedPositions[i].output;
        collateralValueETH += position * floorPrice;
    }

    // Fetch DAO-set prices
    const [totalPositions, daoPrices] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: NFT_DAO_SET_ARRAY.map((address) => ({
                target: address,
            })),
            abi: abi.VAULT_ABI.find(
                (a) => a.name === "totalPositions"
            ),
            block: chainBlocks[chain],
            chain,
        }),
        sdk.api.abi.multiCall({
            calls: NFT_DAO_SET_ARRAY.map((address) => ({
                target: address,
            })),
            abi: abi.VAULT_ABI.find(
                (a) => a.name === "getFloorETH"
            ),
            block: chainBlocks[chain],
            chain,
        })
    ]);

    for (let i = 0; i < totalPositions.output.length; i++) {
        const floorPrice = daoPrices.output[i].output;
        const position = totalPositions.output[i].output;
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
