const sdk = require("@defillama/sdk");
const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const abi = require("./abi.json");
const addresses = require("./addresses.json");
const { nullAddress, sumTokens2 } = require("../helper/unwrapLPs");

const jTokenToToken = {
    "0x662d0f9ff837a51cf89a1fe7e0882a906dac08a3": "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // jETH
    "0x5375616bb6c52a90439ff96882a986d8fcdce421": "arbitrum:0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1", // jgOHM,
    "0xf018865b26ffab9cd1735dcca549d95b0cb9ea19": "arbitrum:0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55", // jDPX
    "0x1f6fa7a58701b3773b08a1a16d06b656b0eccb23": "arbitrum:0x32eb7902d4134bf98a28b963d26de779af92a212" // jrdpx
}

async function tvl(timestamp, block, chainBlocks, { api }) {
    let balances = {};
    let dopexFarms = [addresses.ethDpxFarm, addresses.ethDpxFarm, addresses.rdpxEthFarm, addresses.rdpxEthFarm];
    let metaVaultsAddresses = [addresses.DpxEthBullVault, addresses.DpxEthBearVault, addresses.RdpxEthBullVault, addresses.RdpxEthBearVault];
    let strategyStorageContractsDpxEth = [addresses.JonesDpxEthBullStrategy, addresses.DpxEthStorage, addresses.JonesDpxEthBearStrategy, addresses.DpxEthStorageBear];
    let strategyStorageContractsRdpxEth = [addresses.JonesRdpxEthBullStrategy, addresses.RdpxEthStorage, addresses.JonesRdpxEthBearStrategy, addresses.RdpxEthStorageBear];
    
    block = chainBlocks.arbitrum;
    const chain = "arbitrum";
    const toa = []

    const ethManagementWindow = await api.call({
        target: addresses.ethVaultV3,
        abi: abi.state,
    });

    if (ethManagementWindow === true) {
        const ethSnapshot = await api.call({
            target: addresses.ethVaultV3,
            abi: abi.totalAssets,
        })
        sdk.util.sumSingleBalance(balances, "arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1", ethSnapshot);
    } else {
        toa.push([nullAddress, addresses.ethVaultV3])
    }

    const balanceCalls = []
    const stCalls = []

    dopexFarms.forEach((farm, i) => {
        balanceCalls.push({ target: farm, params: metaVaultsAddresses[i] })
        stCalls.push(farm)
        toa.push([addresses.dpxEthSlp, strategyStorageContractsDpxEth[i]])
        toa.push([addresses.rdpxEthSlp, strategyStorageContractsRdpxEth[i]])
    })
    const bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: balanceCalls }) 
    const sTokens = await api.multiCall({  abi: 'address:stakingToken', calls: stCalls })
    bals.forEach((bal, i) => sdk.util.sumSingleBalance(balances,sTokens[i],bal, api.chain)) 
    
    const vaultManagementWindows = await api.multiCall({
        calls: addresses.vaultandCollateral.map(p => ({
            target: p[0]
        })),
        abi: abi.state,
    })

    const vaultSnapshots = await api.multiCall({
        calls: addresses.vaultandCollateral.map(p => ({
            target: p[0]
        })),
        abi: abi.snapshotAssetBalance,
    })
    
    const vaultBalances = await api.multiCall({
        calls: addresses.vaultandCollateral.map(p => ({
            target: p[1],
            params: p[0]
        })),
        abi: "erc20:balanceOf",
    })

    const vaultAssetBalances = await api.multiCall({
        calls: addresses.vaultandCollateral.map(p => ({
            target: p[0]
        })),
        abi: abi.snapshotAssetBalance,
    })

    for (let i = 0; i < addresses.vaultandCollateral.length; i++) {
        if (vaultManagementWindows[i] === true) {
            sdk.util.sumSingleBalance(balances, `${chain}:${addresses.vaultandCollateral[i][1]}`, vaultSnapshots[i]);
        } else if (vaultAssetBalances[i].success === true) {
            sdk.util.sumSingleBalance(balances, `${chain}:${addresses.vaultandCollateral[i][1]}`, vaultAssetBalances[i]);
        } else {
            sdk.util.sumSingleBalance(balances, `${chain}:${addresses.vaultandCollateral[i][1]}`, vaultBalances[i]);
        }
    }

    Object.values(addresses.trackers).map(tracker =>  toa.push([tracker.token, tracker.holder ]))
    toa.push([addresses.glp, addresses.strategy,])
    return sumTokens2({ api, tokensAndOwners: toa, balances});
}

module.exports = {
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
// node test.js projects/jones-dao/index.js