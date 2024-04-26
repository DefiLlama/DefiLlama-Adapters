const sdk = require("@defillama/sdk");

async function tvl(ts, block, _) {
  return {
    ["0x050C24dBf1eEc17babE5fc585F06116A259CC77A"]: (
      await sdk.api.erc20.totalSupply({
        target: "0x050C24dBf1eEc17babE5fc585F06116A259CC77A",
        block,
        decimals: 8,
        chain: "arbitrum",
      })
    ).output,
  };
}

module.exports = {
  arbitrum: { tvl },
  methodology: `TVL for dlcBTC consists of the total supply of dlcBTC tokens minted.`,
};
