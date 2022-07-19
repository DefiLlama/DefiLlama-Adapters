const sdk = require("@defillama/sdk");

const tokens = [
  {
    holder: "0x5b46A20284366F5e79D9B3e5e2FA0F5702b8C72F", // wmcUSD
    currency: "celo-dollar",
    tokenAddress: "0x918146359264C492BD6934071c6Bd31C854EDBc3", // mcUSD
  },
  {
    holder: "0xD96A74081440C28E9a3c09a3256D6e0454c52E41", // wmcUSD 2
    currency: "celo-dollar",
    tokenAddress: "0x918146359264C492BD6934071c6Bd31C854EDBc3", // mcUSD
  },
  {
    holder: "0xd3D7831D502Ab85319E1F0A18109aa9aBEBC2603", // wmCELO
    currency: "celo",
    tokenAddress: "0x7D00cd74FF385c955EA3d79e47BF06bD7386387D", // mCELO
  },
  {
    holder: "0x337ddAD7Fcb34E93a54a7B6df7C8Bae00fA91D09", // wmCELO 2
    currency: "celo",
    tokenAddress: "0x7D00cd74FF385c955EA3d79e47BF06bD7386387D", // mCELO
  },
  {
    holder: "0xb7e4e9329DA677969376cc76e87938563B07Ac6A", // wmcEUR
    currency: "celo-euro",
    tokenAddress: "0xE273Ad7ee11dCfAA87383aD5977EE1504aC07568", // mcEUR
  },
  {
    holder: "0xAb32a0b6d427ce11a4cEf7Be174A3F291a2753E6", // wmcEUR 2
    currency: "celo-euro",
    tokenAddress: "0xE273Ad7ee11dCfAA87383aD5977EE1504aC07568", // mcEUR
  },
];

const toNumber = (n) => Number(n) / 1e18;

async function tvl(timestamp, ethBlock, { celo: block }) {
  const chain = "celo";
  const balances = {};
  for (let token of tokens) {
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
  celo: { tvl },
};
