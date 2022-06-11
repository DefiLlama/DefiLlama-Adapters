const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const llamaPayAvax = "0x7d507b4c2d7e54da5731f643506996da8525f4a3";
const llamaPayDefault = "0xde1C04855c2828431ba637675B6929A684f84C7F";
const llamaPayVesting = "0xB93427b83573C8F27a08A909045c3e809610411a";

async function calculateTvl(llamapay, vesting, block, chain) {
    const balances = {};

    const contractCount = (await sdk.api.abi.call({
        target: llamapay,
        abi: abi["getLlamaPayContractCount"],
        block,
        chain
    })).output;

    const llamaPayContracts = (await sdk.api.abi.multiCall({
        calls: Array.from({length: Number(contractCount)}, (_, k) => ({
            target: llamapay,
            params: k
        })),
        abi: abi["getLlamaPayContractByIndex"],
        block,
        chain
    })).output;

    const llamaPayTokens = (await sdk.api.abi.multiCall({
        calls: llamaPayContracts.map((p) => ({
            target: p.output
        })),
        abi: abi["token"],
        block,
        chain
    })).output;

    const tokenBalances = (await sdk.api.abi.multiCall({
        calls: llamaPayTokens.map((p) => ({
            target: p.output,
            params: p.input.target
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;

    tokenBalances.map(p => {
        const token = p.input.target.toLowerCase();
        const balance = p.output;
        sdk.util.sumSingleBalance(balances, `${chain}:${token}`, balance);
    })

    return balances;
}

async function avaxTvl(timestamp, block, chainBlocks) {
    return calculateTvl(llamaPayAvax, llamaPayVesting, chainBlocks.avax, "avax");
}

async function arbitrumTvl(timestamp, block, chainBlocks) {
    return calculateTvl(llamaPayDefault, llamaPayVesting, chainBlocks.arbitrum, "arbitrum");
}

async function bscTvl(timestamp, block, chainBlocks) {
    return calculateTvl(llamaPayDefault, llamaPayVesting, chainBlocks.bsc, "bsc");
}

async function fantomTvl(timestamp, block, chainBlocks) {
    return calculateTvl(llamaPayDefault, llamaPayVesting, chainBlocks.fantom, "fantom");
}

async function ethTvl(timestamp, block, chainBlocks) {
    return calculateTvl(llamaPayDefault, llamaPayVesting, block, "ethereum");
}

async function optimismTvl(timestamp, block, chainBlocks) {
    return calculateTvl(llamaPayDefault, llamaPayVesting, chainBlocks.optimism, "optimism")
}

async function polygonTvl(timestamp, block, chainBlocks) {
    return calculateTvl(llamaPayDefault, llamaPayVesting, chainBlocks.polygon, "polygon")
}

async function xdaiTvl(timestamp, block, chainBlocks) {
    return calculateTvl(llamaPayDefault, llamaPayVesting, chainBlocks.xdai, "xdai")
}

module.exports = {
    avalanche: {
        tvl: avaxTvl
    },
    arbitrum: {
        tvl: arbitrumTvl
    },
    bsc: {
        tvl: bscTvl
    },
    fantom: {
        tvl: fantomTvl
    },
    ethereum: {
        tvl: ethTvl
    },
    optimism: {
        tvl :optimismTvl
    },
    polygon: {
        tvl: polygonTvl
    },
    xdai: {
        tvl: xdaiTvl
    }
}