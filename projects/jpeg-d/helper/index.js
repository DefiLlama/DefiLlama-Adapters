const sdk = require("@defillama/sdk");
const { ethers } = require("ethers");
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

// NFT vaults
const CRYPTO_PUNK_VAULT = "0xD636a2fC1C18A54dB4442c3249D5e620cf8fE98F";
const ETHER_ROCKS_VAULT = "0x6837a113aa7393ffbd5f7464e7313593cd2dd560";
const BAYC_VAULT = "0x271c7603aaf2bd8f68e8ca60f4a4f22c4920259f";
const MAYC_VAULT = "0x7b179f9bfbe50cfa401c1cdde3cb2c339c6635f3";
const DOODLES_VAULT = "0x0a36f4bf39ed7d4718bd1b8dd759c19986ccd1a7";

const NFT_CHAINLINKED_ARRAY = [
    CRYPTO_PUNK_VAULT,
    BAYC_VAULT,
    MAYC_VAULT,
    DOODLES_VAULT
];

const NFT_DAO_SET_ARRAY = [
    ETHER_ROCKS_VAULT
];


async function getTVL(balances, chain, timestamp, chainBlocks) {
    // Fetch positions and oracles from vaults
    const [totalChainlinkedPositions, floorOracles] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: NFT_CHAINLINKED_ARRAY.map((address) => ({
                target: address,
            })),
            abi: abi.VAULT_ABI.find(
                (a) => a.name === "totalPositions"
            ),
            block: chainBlocks[chain],
            chain,
        }),
        sdk.api.abi.multiCall({
            calls: NFT_CHAINLINKED_ARRAY.map((address) => ({
                target: address,
            })),
            abi: abi.VAULT_ABI.find(
                (a) => a.name === "floorOracle"
            ),
            block: chainBlocks[chain],
            chain,
        })
    ]);

    // Fetch prices from oracles
    const floorPrices = (
        await sdk.api.abi.multiCall({
            calls: floorOracles.output.map((address) => ({
                target: address.output,
            })),
            abi: abi.PRICEORACLE_ABI.find(
                (a) => a.name === "latestAnswer"
            ),
            chain,
            block: chainBlocks[chain],
        })
    ).output;

    let collateralValueETH = 0;
    for(let i=0; i<totalChainlinkedPositions.output.length; i++){
        const floorPrice = floorPrices[i].output;
        const position = totalChainlinkedPositions.output[i].output;
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

    for(let i=0; i<totalPositions.output.length; i++){
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
