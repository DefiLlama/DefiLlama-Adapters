const { getBlock } = require("../helper/getBlock");
const sdk = require("@defillama/sdk");

const tokens = [
  {
    holder: "0x5b46A20284366F5e79D9B3e5e2FA0F5702b8C72F", // wmcUSD
    currency: "celo-dollar",
    tokenAddress: "0x918146359264C492BD6934071c6Bd31C854EDBc3", // mcUSD
  },
  {
    holder: "0xd3D7831D502Ab85319E1F0A18109aa9aBEBC2603", // wmCELO
    currency: "celo",
    tokenAddress: "0x7D00cd74FF385c955EA3d79e47BF06bD7386387D", // mCELO
  },
  {
    holder: "0xb7e4e9329DA677969376cc76e87938563B07Ac6A", // wmcEUR
    currency: "celo-euro",
    tokenAddress: "0xE273Ad7ee11dCfAA87383aD5977EE1504aC07568", // mcEUR
  },
];

const toNumber = (n) => Number(n) / 1e18;

async function tvl(timestamp, ethBlock, chainBlocks) {
  const chain = "celo";
  const block = await getBlock(timestamp, chain, chainBlocks);
  const balances = {};
  for (token of tokens) {
    const bal = await sdk.api.erc20.balanceOf({
      block,
      chain,
      target: token.tokenAddress,
      owner: token.holder,
    });
    sdk.util.sumSingleBalance(balances, token.currency, toNumber(bal.output));
  }
  return balances;
}

module.exports = {
  methodology:
    "Poof uses wrapped Moola tokens to hold user balances. Calculate how many Moola tokens are in each of these wrapped tokens.",
  tvl,
};
