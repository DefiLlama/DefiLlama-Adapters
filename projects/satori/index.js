const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const USDT_TOKEN_CONTRACT = "0x1E4a5963aBFD975d8c9021ce480b42188849D41d";
const WALLET_ADDR = [
  "0x62e724cB4d6C6C7317e2FADe4A03001Fe7856940",
  "0xA59a2365D555b24491B19A5093D3c99b119c2aBb",
];
async function get_blance(address, api) {
  let mount;
  let sum = new BigNumber(0);
  for (addr of address) {
    // console.log(addr);
    const collateralBalance = await api.call({
      abi: "erc20:balanceOf",
      target: USDT_TOKEN_CONTRACT,
      params: [addr],
    });
    mount = new BigNumber(collateralBalance);
    // console.log(mount);
    sum = sum.plus(mount);
  }
  //   console.log(sum);
  return sum.toString();
}

async function tvl(_, _1, _2, { api }) {
  const balances = {};
  const collateralBalance = await get_blance(WALLET_ADDR, api);
  await sdk.util.sumSingleBalance(
    balances,
    USDT_TOKEN_CONTRACT,
    collateralBalance,
    api.chain
  );
  // console.log(balances);
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  polygon_zkevm: {
    tvl,
  },
};
