import { post } from "../helper/http"


async function tvl() {

    const controller = 'vYlv6Dx8ZGt4oGaqsXaPjh9qi8iS8eQsoU9Ai65km4A'

    const supportedTokens = Object.values(await DryRun(controller, "Get-Tokens"))

    const loTokenBalances = await Promise.all(supportedTokens.map(tokenID => DryRun(tokenID, "Balance")));

    console.log(loTokenBalances)

    // get token USD total value

}


// Access AO on chain data via a node
async function DryRun(target, action) {
    const { Messages: [{ Data }] } = await post(`https://cu.ao-testnet.xyz/dry-run?process-id=${target}`, { 
        Id: "1234", Target: target, Owner: "1234", Anchor: "0", Data: "1234",
        Tags: [
            ["Target", target],
            ["Action", action],
            ["Data-Protocol", "ao"],
            ["Type", "Message"],
            ["Variant", "ao.TN.1"]
        ].map(([name, value]) => ({ name, value }))
    });
    return JSON.parse(Data);
}


module.exports = {
  methodology: "TVL is calculated by getting all supported token pools on LiquidOps, then the lent token balances from the pools and adding up all token USD values provided by CoinGecko.",
  LiquidOps: { tvl },
};


