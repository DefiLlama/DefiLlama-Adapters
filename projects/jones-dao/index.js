const sdk = require("@defillama/sdk");
const { pool2s } = require("../helper/pool2");
const { staking } = require("../helper/staking");
const abi = require("./abi.json");

const jones = "0x10393c20975cf177a3513071bc110f7962cd67da";
const jonesStaking = "0xf1a26cf6309a59794da29b5b2e6fabd3070d470f";

const ethVault = "0x6be861aA87009331bF62E22D418Ab666e88B1354";

const vaultandCollateral = [
    ["0x9a62E407028961EaC4538453Cb5D97038b69C814", "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1"],// gOHM
    ["0xBa3386D94FC593a1e9A5b57fF02524396080f7b4", "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55"] // DPX 
]

const jTokenToToken = {
    "0x662d0f9ff837a51cf89a1fe7e0882a906dac08a3": "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // jETH
    "0x5375616bb6c52a90439ff96882a986d8fcdce421": "arbitrum:0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1", // jgOHM,
    "0xf018865b26ffab9cd1735dcca549d95b0cb9ea19": "arbitrum:0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55", // jDPX
}

const lpStaking = [
    "0x360a766F30F0Ba57d2865eFb32502FB800b14dD3", // JONES-ETH LP 
    "0x13f6A63867046107780Bc3fEBdeE90E7AfCdfd99", // JONES-USDC LP 
    "0xBAc58e8b57935A0B60D5Cb4cd9F6C21049595F04", // jETH-ETH LP 
    "0x7eCe38dBE9D61D0d9Bf2D804A87A7d21b5937a56", // jgOHM-gOHM LP
    "0x5723be83199C9Ec68ED0Ac979e98381224870e7f" // jDPX-DPX LP
]

const lps = [
    "0xe8EE01aE5959D3231506FcDeF2d5F3E85987a39c", // JONES-ETH LP
    "0xa6efc26daa4bb2b9bf5d23a0bc202a2badc2b59e", // JONES-USDC LP
    "0xdf1a6dd4e5b77d7f2143ed73074be26c806754c5", // jETH-ETH LP
    "0x292d1587a6bb37e34574c9ad5993f221d8a5616c", // jgOHM-gOHM LP
    "0xeeb24360c8c7a87933d16b0075e10e1a30ad65b7" // jDPX-DPX LP
]

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    block = chainBlocks.arbitrum;
    chain = "arbitrum";

    const ethManagementWindow = (await sdk.api.abi.call({
        target: ethVault,
        abi: abi.MANAGEMENT_WINDOW_OPEN,
        block,
        chain
    })).output;
    if (ethManagementWindow === true) {
        const ethSnapshot = (await sdk.api.abi.call({
            target: ethVault,
            abi: abi.snapshotVaultBalance,
            block,
            chain
        })).output;
        sdk.util.sumSingleBalance(balances, "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", ethSnapshot);
    } else {
        const ethBalance = (await sdk.api.eth.getBalance({
            target: ethVault,
            block,
            chain
        })).output;
        sdk.util.sumSingleBalance(balances, "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", ethBalance);
    }

    const vaultManagementWindows = (await sdk.api.abi.multiCall({
        calls: vaultandCollateral.map(p => ({
            target: p[0]
        })),
        abi: abi.MANAGEMENT_WINDOW_OPEN,
        block,
        chain
    })).output;

    const vaultSnapshots = (await sdk.api.abi.multiCall({
        calls: vaultandCollateral.map(p => ({
            target: p[0]
        })),
        abi: abi.snapshotVaultBalance,
        block,
        chain
    })).output;

    const vaultBalances = (await sdk.api.abi.multiCall({
        calls: vaultandCollateral.map(p => ({
            target: p[1],
            params: p[0]
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;

    for (let i = 0; i < vaultandCollateral.length; i++) {
        if (vaultManagementWindows[i].output === true) {
            sdk.util.sumSingleBalance(balances, `arbitrum:${vaultandCollateral[i][1]}`, vaultSnapshots[i].output);
        } else {
            sdk.util.sumSingleBalance(balances, `arbitrum:${vaultandCollateral[i][1]}`, vaultBalances[i].output);
        }
    }

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