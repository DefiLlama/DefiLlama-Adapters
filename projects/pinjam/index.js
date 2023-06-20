const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");

const stakingContract = "0x6413707acd0eF29E54e4f7eE931bb00575868eA4";
const PINKAV = "0xE5274E38E91b615D8822e8512a29A16FF1B9C4Af";
const ADDRESSES = {
  kava: {
    lendingPool: "0x11C3D91259b1c2Bd804344355C6A255001F7Ba1e",
    tokens: {
      kava: "0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b",
      multiUsdt: "0xb44a9b6905af7c801311e8f4e76932ee959c663c",
      multiUsdc: "0xfa9343c3897324496a05fc75abed6bac29f8a40f",
      multiDai: "0x765277eebeca2e31912c9946eae1021199b39c61",
      multiEth: "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
    },
    pTokens: {
      kava: "0xb096768a0E4f5d08927C19Df9651293485b21072",
      multiUsdt: "0x16831114Dc5e44696f7aFf58C11865F1880E9E2a",
      multiUsdc: "0x0a7B71B0613FA58A742CddFC72963ACb9412760c",
      multiDai: "0x2C0cA21e35B6f1C1A33fBD99D21Da1C63ad09e69",
      multiEth: "0x82Ef01018980740a2C6c0f7cBcf840c42a629dBd",
    },
    vdTokens: {
      kava: "0x13aB1A2e26f0F1022F2286960055847100Bd7218",
      multiUsdt: "0x67EaA3aEc47aAaBc8e5F4904ba15bf2409940244",
      multiUsdc: "0x840c1911Bc9919DACd86Cffaf3f1436BAE314cD0",
      multiDai: "0xAd58d7E4B70B9cF068246bD1a7Bd2b88f25B8FEf",
      multiEth: "0x9421fFcFD3Edb1b3ca8Ef7B1104016bc529BB840",
    },
  },
};

function lending(borrowed) {
  return async (_, _1, _2, { api }) => {
    const balances = {};

    const tokensObj = borrowed
      ? ADDRESSES[api.chain].vdTokens
      : ADDRESSES[api.chain].pTokens;

    const totalSupplyOfTokens = await api.batchCall(
      Object.values(tokensObj).map((token) => ({
        abi: "erc20:totalSupply",
        target: token,
      }))
    );

    const sumSingleBalancePromises = [];

    let i = -1;
    for (const tokenKey of Object.keys(tokensObj)) {
      i++;

      sumSingleBalancePromises.push(
        sdk.util.sumSingleBalance(
          balances,
          ADDRESSES[api.chain].tokens[tokenKey],
          totalSupplyOfTokens[i],
          api.chain
        )
      );
    }

    await Promise.all(sumSingleBalancePromises);

    return balances;
  };
}

module.exports = {
  timetravel: true,
  methodology:
    "Counts the total tokens supplied to the lending pool and the total tokens borrowed from the lending pool.",
  kava: {
    tvl: lending(false),
    borrowed: lending(true),
    staking: staking(stakingContract, PINKAV, "kava"),
  },
};
