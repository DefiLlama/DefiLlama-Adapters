const sdk = require("@defillama/sdk");

const cdpModule = "0x1Cd97ee98f3423222f7B4CDdb383f2EE2907E628";
const psm = "0x0e1Ddf8D61f0570Bf786594077CD431c727335A9";

const usdt = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const mooGmxGlp = "0x9dbbBaecACEDf53d5Caa295b8293c1def2055Adc";

const tokensAndOwners = [
  [usdt, psm],
  [mooGmxGlp, cdpModule],
];

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const results = (
    await sdk.api.abi.multiCall({
      calls: tokensAndOwners.map((x) => ({
        target: x[0],
        params: [x[1]],
      })),
      abi: "erc20:balanceOf",
      chain: "arbitrum",
      chainBlocks,
    })
  ).output;
  for (const i in results) {
    const result = results[i];
    await sdk.util.sumSingleBalance(
      balances,
      `arbitrum:${result.input.target}`,
      result.output
    );
  }
  return balances;
}

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology: "mooGmxGLP in CDP Module and USDT in PSM",
};
