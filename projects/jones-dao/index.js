const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { pool2s } = require("../helper/pool2");
const { staking } = require("../helper/staking");

const jones = "0x10393c20975cf177a3513071bc110f7962cd67da";
const jonesStaking = "0xf1a26cf6309a59794da29b5b2e6fabd3070d470f";

const vaults = [
    "0x50744d5e6D138ACA596F7D36E659d097BE2d561C", // ETH
    "0xeefD6ba4F562330a3ba35BAdcE2210A2e6dd2281" // gOHM
]

const jTokenToToken = {
    "0x662d0f9ff837a51cf89a1fe7e0882a906dac08a3": "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // jETH
    "0x5375616bb6c52a90439ff96882a986d8fcdce421": "arbitrum:0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1" // jgOHM
}

const lpStaking = [
    "0x360a766F30F0Ba57d2865eFb32502FB800b14dD3", // JONES-ETH LP 
    "0x13f6A63867046107780Bc3fEBdeE90E7AfCdfd99", // JONES-USDC LP 
    "0xBAc58e8b57935A0B60D5Cb4cd9F6C21049595F04", // jETH-ETH LP 
    "0x7eCe38dBE9D61D0d9Bf2D804A87A7d21b5937a56" // jgOHM-gOHM LP
]

const lps = [
    "0xe8EE01aE5959D3231506FcDeF2d5F3E85987a39c", // JONES-ETH LP
    "0xa6efc26daa4bb2b9bf5d23a0bc202a2badc2b59e", // JONES-USDC LP
    "0xdf1a6dd4e5b77d7f2143ed73074be26c806754c5", // jETH-ETH LP
    "0x292d1587a6bb37e34574c9ad5993f221d8a5616c" // jgOHM-gOHM LP
]

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    block = chainBlocks.arbitrum;
    chain = "arbitrum";
    const vaultBalances = (await sdk.api.abi.multiCall({
        calls: vaults.map(p => ({
            target: p
        })),
        abi: abi["snapshotVaultBalance"],
        block,
        chain
    })).output;
    sdk.util.sumSingleBalance(balances, "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", vaultBalances[0].output);
    sdk.util.sumSingleBalance(balances, "arbitrum:0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1", vaultBalances[1].output);

    return balances;
}

module.exports = {
    misrepresentedTokens: true,
    arbitrum: {
        tvl,
        pool2: pool2s(lpStaking, lps, "arbitrum", addr=>{
            addr = addr.toLowerCase();
            if (jTokenToToken[addr] !== undefined) {
                return jTokenToToken[addr];
            }
            return `arbitrum:${addr}`;
        }),
        staking: staking(jonesStaking, jones, "arbitrum")
    }
}