const sdk = require("@defillama/sdk");
const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const abi = require("./abi.json");
const addresses = require("./addresses.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform } = require('../helper/portedTokens')

const jTokenToToken = {
    "0x662d0f9ff837a51cf89a1fe7e0882a906dac08a3": "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // jETH
    "0x5375616bb6c52a90439ff96882a986d8fcdce421": "arbitrum:0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1", // jgOHM,
    "0xf018865b26ffab9cd1735dcca549d95b0cb9ea19": "arbitrum:0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55", // jDPX
    "0x1f6fa7a58701b3773b08a1a16d06b656b0eccb23": "arbitrum:0x32eb7902d4134bf98a28b963d26de779af92a212" // jrdpx
}

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    let slps = [addresses.dpxEthSlp, addresses.dpxEthSlp, addresses.rdpxEthSlp, addresses.rdpxEthSlp];
    let dopexFarms = [addresses.ethDpxFarm, addresses.ethDpxFarm, addresses.rdpxEthFarm, addresses.rdpxEthFarm];
    let metaVaultsAddresses = [addresses.DpxEthBullVault, addresses.DpxEthBearVault, addresses.RdpxEthBullVault, addresses.RdpxEthBearVault];
    let strategyStorageContractsDpxEth = [addresses.JonesDpxEthBullStrategy, addresses.DpxEthStorage, addresses.JonesDpxEthBearStrategy, addresses.DpxEthStorageBear];
    let strategyStorageContractsRdpxEth = [addresses.JonesRdpxEthBullStrategy, addresses.RdpxEthStorage, addresses.JonesRdpxEthBearStrategy, addresses.RdpxEthStorageBear];
    
    block = chainBlocks.arbitrum;
    const chain = "arbitrum";
    const transformAddress = await getChainTransform(chain)

    const ethManagementWindow = (await sdk.api.abi.call({
        target: addresses.ethVaultV3,
        abi: abi.state,
        block,
        chain
    })).output; // node test.js projects/jones-dao/index.js

    if (ethManagementWindow === true) {
        const ethSnapshot = (await sdk.api.abi.call({
            target: addresses.ethVaultV3,
            abi: abi.totalAssets,
            block,
            chain
        })).output;
        sdk.util.sumSingleBalance(balances, "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", ethSnapshot);
    } else {
        const ethBalance = (await sdk.api.eth.getBalance({
            target: addresses.ethVaultV3,
            block,
            chain
        })).output;
        sdk.util.sumSingleBalance(balances, "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", ethBalance);
    }
    
    for (let i = 0; i < 3; i++) {
        let temp = (await sdk.api.abi.call({
            target: dopexFarms[i],
            abi: abi.balanceOf,
            params: metaVaultsAddresses[i],
            block,
            chain
        })).output;

        await unwrapUniswapLPs(
            balances, 
            [
                {
                    balance: temp,
                    token: slps[i]
                }
            ],
            block,
            chain,
            transformAddress
        );

        let dpxEthBalance = (await sdk.api.abi.call({
            target: addresses.dpxEthSlp,
            abi: abi.balanceOf,
            params: strategyStorageContractsDpxEth[i],
            block,
            chain
        })).output;

        await unwrapUniswapLPs(
            balances,
            [
                {
                    balance: dpxEthBalance,
                    token: addresses.dpxEthSlp
                }
            ],
            block,
            chain,
            transformAddress
        );

        let rdpxEthBalance = (await sdk.api.abi.call({
            target: addresses.rdpxEthSlp,
            abi: abi.balanceOf,
            params: strategyStorageContractsRdpxEth[i],
            block,
            chain
        })).output;

        await unwrapUniswapLPs(
            balances,
            [
                {
                    balance: rdpxEthBalance,
                    token: addresses.rdpxEthSlp
                }
            ],
            block,
            chain,
            transformAddress
        );
    }
    
    const vaultManagementWindows = (await sdk.api.abi.multiCall({
        calls: addresses.vaultandCollateral.map(p => ({
            target: p[0]
        })),
        abi: abi.state,
        block,
        chain
    })).output;

    const vaultSnapshots = (await sdk.api.abi.multiCall({
        calls: addresses.vaultandCollateral.map(p => ({
            target: p[0]
        })),
        abi: abi.snapshotAssetBalance,
        block,
        chain
    })).output;
    
    const vaultBalances = (await sdk.api.abi.multiCall({
        calls: addresses.vaultandCollateral.map(p => ({
            target: p[1],
            params: p[0]
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;

    const vaultAssetBalances = (await sdk.api.abi.multiCall({
        calls: addresses.vaultandCollateral.map(p => ({
            target: p[0]
        })),
        abi: abi.snapshotAssetBalance,
        block,
        chain
    })).output;

    for (let i = 0; i < addresses.vaultandCollateral.length; i++) {
        if (vaultManagementWindows[i].output === true) {
            sdk.util.sumSingleBalance(balances, `arbitrum:${addresses.vaultandCollateral[i][1]}`, vaultSnapshots[i].output);
        } else if (vaultAssetBalances[i].success === true) {
            sdk.util.sumSingleBalance(balances, `arbitrum:${addresses.vaultandCollateral[i][1]}`, vaultAssetBalances[i].output);
        } else {
            sdk.util.sumSingleBalance(balances, `arbitrum:${addresses.vaultandCollateral[i][1]}`, vaultBalances[i].output);
        }
    }

    return balances;
}

module.exports = {
    misrepresentedTokens: true,
    arbitrum: {
        tvl,
        pool2: pool2s(addresses.lpStaking, addresses.lps, "arbitrum", addr=>{
            addr = addr.toLowerCase();
            if (jTokenToToken[addr] !== undefined) {
                return jTokenToToken[addr];
            }
            return `arbitrum:${addr}`;
        }),
        staking: stakings(addresses.jonesStaking, addresses.jones, "arbitrum")
    }
}