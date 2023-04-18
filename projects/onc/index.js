const sdk = require("@defillama/sdk");

function tvl(treasury, tokens) {
  return async function (_0, _1, _2, { chain }) {
    const balance = await Promise.all(
      tokens.map((token) =>
        sdk.api.erc20.balanceOf({
          target: token,
          owner: treasury,
          chain,
        })
      )
    );
    const result = {};
    for (let i = 0; i < tokens.length; i++) {
      result[chain + ":" + tokens[i]] = balance[i].output;
    }
    return result;
  };
}

module.exports = {
  methodology: "Gets TVL inside the ONC Treasury.",
  era: {
    tvl: tvl("0x581f87De7a655f50932F706873fcc7024d2309Fa", [
      "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", // USDC
      "0x4BEf76b6b7f2823C6c1f4FcfEACD85C24548ad7e", // DAI
    ]),
  },
  kava: {
    tvl: tvl("0x481654217A24B43fB63a7761d7033Fdf9361eAB6", [
      "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b", // WKAVA
    ]),
  },
  arbitrum: {
    tvl: tvl("0xc9cb7AB00802165e316A6f8c241E87E0Ee72e787", [
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC
      "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
      "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
    ]),
  },
  bsc: {
    tvl: tvl("0x7c24b813089675cf5484afa4850FE9276D97b461", [
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
      "0x55d398326f99059fF775485246999027B3197955", // USDT
      "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // DAI
    ]),
  },
  avax: {
    tvl: tvl("0xD5a7Df8B56d285011AbE406235109c029F45797A", [
      "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
      "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", // USDT
      "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", // DAI
    ]),
  },
};
