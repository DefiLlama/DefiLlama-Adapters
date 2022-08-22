const sdk = require("@defillama/sdk");
const { ethers } = require("ethers");
const abi = require("./abis");

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const CRYPTO_PUNK_VAULT = "0xD636a2fC1C18A54dB4442c3249D5e620cf8fE98F";
const ETHER_ROCKS_VAULT = "0x6837a113aa7393ffbd5f7464e7313593cd2dd560";
const BAYC_VAULT = "0x271c7603aaf2bd8f68e8ca60f4a4f22c4920259f";
const MAYC_VAULT = "0x7b179f9bfbe50cfa401c1cdde3cb2c339c6635f3";

const NFT_CHAINLINKED_ARRAY = [
    CRYPTO_PUNK_VAULT,
    BAYC_VAULT,
    MAYC_VAULT
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
                params: [ethers.utils.formatBytes32String("")],
            })),
            abi: abi.VAULT_ABI.find(
                (a) => a.name === "nftTypeValueETH"
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

module.exports = {
    getTVL,
};
