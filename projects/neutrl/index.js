const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");


const ELP_ADDRESS = "0x8cad6c2317233D38a3cf4601F4A441f316F77Db3";
const ROYCO_ADDRESS = "0x1F8B025D61Cd54E81B6e4f4fC1A8fc757bc50bcf";

// USDT, USDC, and USDE addresses (mainnet)
const USDT = ADDRESSES.ethereum.USDT;
const USDC = ADDRESSES.ethereum.USDC;
const USDE = ADDRESSES.ethereum.USDe;


async function tvl(timestamp, block, chainBlocks, { api }) {
    const chain = api.chain;
    const balances = {};
    const fromBlock = 22375087;

    // Fetch Deposit events using helper
    const depositLogs = await getLogs({
        api,
        target: ELP_ADDRESS,
        eventAbi: "event Deposit(address indexed user, address indexed asset, uint256 amount)",
        fromBlock,
        onlyArgs: true,
    });

    // Process Deposit events and update balances
    for (const [_, asset, amount] of depositLogs) {
        // Only track USDT, USDC, and USDE deposits
        if ([USDT, USDC, USDE].map(a => a.toLowerCase()).includes(asset.toLowerCase())) {
            sdk.util.sumSingleBalance(balances, `${chain}:${asset}`, amount.toString());
        }
    }

    const roycoDepositLogs = await getLogs({
        api,
        target: ROYCO_ADDRESS,
        eventAbi: "event Deposit(address indexed user, address indexed asset, uint256 amount)",
        fromBlock,
        onlyArgs: true,
    });

    // Process Deposit events and update balances
    for (const [_, asset, amount] of roycoDepositLogs) {
        // Only track USDT, USDC, and USDE deposits
        if ([USDC].map(a => a.toLowerCase()).includes(asset.toLowerCase())) {
            sdk.util.sumSingleBalance(balances, `${chain}:${asset}`, amount.toString());
        }
    }

    return balances;
}


module.exports = {
    methodology: "TVL is calculated by tracking Deposit events of USDT, USDC, and USDE to the different deposits addresses",
    start: 22375087, // Adjust this to be close to when the contract was deployed
    ethereum: { // Assuming this is on Ethereum mainnet, change if on a different chain
        tvl,

    }
};