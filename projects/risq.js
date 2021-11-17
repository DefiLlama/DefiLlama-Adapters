const sdk = require("@defillama/sdk");
const { transformBscAddress } = require('./helper/portedTokens');

const bnbPool = "0x55D10490C500FBF334C0fD91A0b205a5D64b9367"; //BNB_POOL
const WBNBAddresss = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

const poolsV1 = [
    "0x3BEC8B9e416d65209eB5432aDDCb38146E977CcB", //WBTC_POOL
    "0xCB73c1472832615Dad82Af5bb34f55cdC7C9b0C5", //ETH_POOL
    "0xaD5D3593f7821394956D520181a3Cf5371CB1420", //BCH_POOL
    "0xFBB55B8A0Bf58dD1B163170731A6766BDAceB677", //LTC_POOL
    "0x485d254532d2132F32be5b1A9E2D0F1Dd10B2baC", //COMP_POOL
    "0xc1A58426E3dDd28Cb73f75F9Ae92A0B4a68394b4", //CAKE_POOL
    "0x0a985cb13e44184405990c6eD0C717AaEcEd4666", //UNI_POOL
    "0xeFF6515bbB8A6cdDeb187352e293D7debFFDb4Fd", //LINK_POOL
    "0x8DCEf72912f57410E3047E8863d63b261A679Ed9"  //YFI_POOL
];

const tokens = [
    "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //WBTC
    "0x2170ed0880ac9a755fd29b2688956bd959f933f8", //WETH
    "0x8ff795a6f4d97e7887c79bea79aba5cc76444adf", //BCH
    "0x4338665cbb7b2485a8855a139b75d5e34ab0db94", //LTC
    "0x52ce071bd9b1c4b00a0b92d298c512478cad67e8", //COMP
    "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", //CAKE
    "0xbf5140a22578168fd562dccf235e5d43a02ce9b1", //UNI
    "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd", //LINK
    "0x88f1a5ae2a3bf98aeaf342d26b30a79438c9142e" //YFI
];
// node test.js projects/a.js
async function tvl(_timestamp, ethBlock, chainBlocks) {
    const transform = await transformBscAddress();
    let balances = {};

    const vaultBalances = (await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        target: tokens.BNB,
        calls: tokens.map((t, i) => ({
            target: t,
            params: poolsV1[i]
        })),
        block: chainBlocks["bsc"],
        chain: 'bsc',
    })).output.map(b => b.output);

    for (let i = 0; i < tokens.length; i++) {
        balances[transform(tokens[i])] = ((transform(tokens[i]) in balances) ? 
            Number(balances[transform(tokens[i])]) + Number(vaultBalances[i]) :
            vaultBalances[i]);
    };

    balances[transform(WBNBAddresss)] = (await sdk.api.eth.getBalance({
        target: bnbPool, 
        block: chainBlocks["bsc"],
        chain: 'bsc'
    })).output;

    return balances;
};

module.exports = {
    name: "Risq Protocol", // project name
    website: "https://risq.capital",
    category: "Options",
    start: 10340221, // Aug-25-2021 03:12:42 PM +UTC
    bsc: {
      tvl,
    }
};