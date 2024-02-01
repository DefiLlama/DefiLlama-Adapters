const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const {addFundsInMasterChef} = require("../helper/masterchef");
const {pool2BalanceFromMasterChefExports} = require("../helper/pool2");
const {staking} = require("../helper/staking");

const token = "0xfe27133f2e8c8539363883d914bccb4b21ebd28a";
const masterchef = "0x81A9A4e95443B505ee6b10227E61b74D39CDeBc0";

const wMEMO = "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b"
const time = "avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3";

const wsSPA= "0x89346b51a54263cf2e92da79b1863759efa68692";
const spa = "fantom:0x5602df4a94eb6c680190accfa2a475621e0ddbdc";

const translate = {
    [ADDRESSES.fantom.DAI]:ADDRESSES.ethereum.DAI,
    "0x9879abdea01a879644185341f7af7d8343556b7a":ADDRESSES.ethereum.TUSD,
    "0x9f47f313acfd4bdc52f4373b493eae7d5ac5b765":"avax:" + ADDRESSES.avax.JOE,
    "0x511d35c52a3c244e7b8bd92c0c297755fbd89212":"avax:" + ADDRESSES.avax.WAVAX
}

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.fantom, "fantom", addr=> {
        addr = addr.toLowerCase();
        if (translate[addr] !== undefined) {
            return translate[addr];
        }
        return `fantom:${addr}`
    }, undefined, [token], true, true, token);
    const memo = (await sdk.api.abi.call({
        target: wMEMO,
        params: [balances["fantom:0xddc0385169797937066bbd8ef409b5b3c0dfeb52"]],
        abi:'function wMEMOToMEMO(uint256 _amount) view returns (uint256)',
        block: chainBlocks.avax,
        chain: "avax",
    })).output;
    balances[time] = memo
    delete balances["fantom:0xddc0385169797937066bbd8ef409b5b3c0dfeb52"];
    const sSPA = (await sdk.api.abi.call({
        target: wsSPA,
        params:[balances["fantom:0x89346b51a54263cf2e92da79b1863759efa68692"]],
        abi: 'function wOHMTosOHM(uint256 _amount) view returns (uint256)',
        block: chainBlocks.fantom,
        chain: "fantom"
    })).output;
    balances[spa] = sSPA;
    delete balances["fantom:0x89346b51a54263cf2e92da79b1863759efa68692"];
    return balances;
}

module.exports = {
    fantom: {
        tvl,
        pool2: pool2BalanceFromMasterChefExports(masterchef, token, "fantom", addr=>`fantom:${addr}`),
        staking: staking(masterchef, token, "fantom")
    }
}