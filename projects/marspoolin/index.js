const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const contracts = [
  // pETH18C_CONTRACT
  "0xf3da734c6040665eAc90F1466d23301d6d0b7Cb7",
  // pBTC35A_CONTRACT
  "0x5CBaDe4D03Ea436F792E9f939E70908524949efD",
];

const erc20TokenContracts = [
  // pETH18C_CONTRACT
  "0xA15690E9205De386Ce849889831C1668c300C1ad",
  // pBTC35A_CONTRACT
  "0xA8b12Cc90AbF65191532a12bb5394A714A46d358",
];

const vaultsContracts = [
  // pBTC35A-USDT
  "0xaE26170200ec3aE66B8AfAa87f2FA49C1E0A02B9",
  // pETH18C-USDT
  "0x16A60d78fE6F92D25EBDDAfF6B1efC9d193d4fC8",
  // MARS-USDT
  "0x9b9c2D202F9a0ed9Be9DaF9Df50CC0e327A809dd",
];

const lpVaults = [
  // pBTC35A-USDT LP
  "0x5B1e45cA08fA4d65aA7FDcF9e116990fB7FcE73B",
  // pETH18C-USDT LP
  "0x2Dc9d00DA9542f91D5391bE53Ed1D58a04EC1C07",
  // MARS-USDT LP
  "0x64b91b92240bC1901855Dd55AE632addB650d089",
];

const ethTvl = async (timestamp, ethBlock) => {
  const balances = {};

  const tokenBalance = (
    await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: erc20TokenContracts.map((etc, idx) => ({
        target: etc,
        params: contracts[idx],
      })),
      ethBlock,
    })
  ).output.map((bal) => bal.output);

  for (let index = 0; index < erc20TokenContracts.length; index++) {
    sdk.util.sumSingleBalance(
      balances,
      erc20TokenContracts[index],
      tokenBalance[index]
    );
  }

  const lpBalances = (
    await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: lpVaults.map((vc, idx) => ({
        target: vc,
        params: vaultsContracts[idx],
      })),
      ethBlock,
    })
  ).output.map((bal) => bal.output);

  const lpPositions = [];

  for (let i = 0; i < lpVaults.length; i++) {
    lpPositions.push({
      balance: lpBalances[i],
      token: lpVaults[i],
    });
  }

  await unwrapUniswapLPs(balances, lpPositions, ethBlock);

  return balances;
};

module.exports = {
    ethereum: {
    tvl: ethTvl,
  },
};
