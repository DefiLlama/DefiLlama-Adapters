const sdk = require("@defillama/sdk");
const MINT_TOKEN_CONTRACT = "0xD77B108d4f6cefaa0Cae9506A934e825BEccA46E";
const WINR_VAULT_CONTRACT = "0x8c50528F4624551Aad1e7A265d6242C3b06c9Fca";
const WLP_TOKEN_CONTRACT = "0x6f7353B59476dbd1dE23d7113BE7A7fbE6F343E5";
const abi = require("./abi");
const { toUSDT } = require("../helper/balances");
const { BN } = require("bn.js");

async function tvl(_, _1, _2, { api }) {
  const total_supply = {};
  let vault_tvl = {};

  const collateralBalance = await api.call({
    abi: "erc20:totalSupply",
    target: MINT_TOKEN_CONTRACT,
  });

  const vault_balance = await api.call({
    abi: abi.getReserve,
    target: WINR_VAULT_CONTRACT,
  });

  await sdk.util.sumSingleBalance(
    total_supply,
    MINT_TOKEN_CONTRACT,
    collateralBalance,
    api.chain
  );

  let bn = new BN(vault_balance);
  bn = bn.div(new BN(10).pow(new BN(30)));

  vault_tvl["arbitrum:0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"] = toUSDT(bn);

  await sdk.util.mergeBalances(total_supply, vault_tvl);

  return total_supply;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Total Supply of WINR Token",
  start: 67057671,
  arbitrum: {
    tvl,
  },
};
