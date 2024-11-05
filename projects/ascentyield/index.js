const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/solana");
const { post } = require('../helper/http');
const { sumTokensExport } = require("../helper/unwrapLPs")


const hyperliquidSubAccount = "0x75b2e5c67d2116bcf1b77c5e6444fc18bc5d38a4" // for trading at hyperliquid
const jlpholder = "9nAgg9wAnuiPv57dXkmCwoGhhbTHS1RRzvYLjnRGZtXp" // for keeping JLP and USDC(buy JLP)
const arbiusdcholder = "0xa6Ff9a77D6bD8B0a759055Cd8885e23228bc10Ec" // USDC on arbi(will bridge to solana)
const hyperliquidMainAccount = "0x7151609Fdc7E0Cac89FB9720F0957AF9d552f8f9" // will transfer USDC to sub account


module.exports = {
    methodology: "Aggregate trading account margins in HyperLiquid and JLP, USDC on the solana network.",
    solana: {
        tvl: async (api) => {
            return sumTokens2({
                owner: jlpholder
            });
        },
    },
    hyperliquid: {
        tvl: async (api) => {
            let data = await post('https://api.hyperliquid.xyz/info', {
                type: "clearinghouseState",
                user: hyperliquidSubAccount
            })
            data = parseInt(data.marginSummary.accountValue)
            api.addCGToken('usd-coin', data)
        }
    },
    arbitrum: {
        tvl: sumTokensExport({
            owners: [arbiusdcholder, hyperliquidMainAccount],
            tokens: [ADDRESSES.arbitrum.USDC_CIRCLE,]
        })
    },
};
