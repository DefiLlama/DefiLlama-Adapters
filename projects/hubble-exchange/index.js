const sdk = require("@defillama/sdk");
const { ethers } = require("ethers");

const insuranceFund = "0x870850A72490379f60A4924Ca64BcA89a6D53a9d";
const marginAccount = "0x7648675cA85DfB9e2F9C764EbC5e9661ef46055D";

const hUSD = "0x5c6FC0AaF35A55E7a43Fff45575380bCEdb5Cbc2";
const collaterals = [
  {
    token: "avalanche-2",
    address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    decimals: 18,
  },
  { token: "usd-coin", address: hUSD, decimals: 6 },
];

async function tvl(timestamp, block, chainBlocks) {
  const calls = [
    ...collaterals.map((c) => ({
      target: c.address,
      params: marginAccount,
    })),
    { target: hUSD, params: insuranceFund },
  ];

  const tokens = await sdk.api.abi.multiCall({
    calls,
    abi: "erc20:balanceOf",
    block: chainBlocks["avax"],
    chain: "avax",
  });
  const balancesSum = {};
  await sdk.util.sumMultiBalanceOf(balancesSum, tokens);
  const balances = {};
  collaterals.forEach((c) => {
    balances[c.token] = Number(
      ethers.utils.formatUnits(balancesSum[c.address], c.decimals)
    );
  });

  return balances;
}

module.exports = {
  avalanche: {
    tvl,
  },
};
