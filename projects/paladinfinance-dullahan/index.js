const ADDRESSES = require('../helper/coreAssets.json');

const DULLAHAN_VAULT = "0x167c606be99DBf5A8aF61E1983E5B309e8FA2Ae7";

async function tvl(api,) {
  api.add(ADDRESSES.ethereum.AAVE, await api.call({ target: DULLAHAN_VAULT, abi: 'uint256:totalAssets' }));
}

module.exports = {
  doublecounted: true,
  methodology: "Amount of stkAAVE owned by the vault",
  ethereum: {
    tvl,
  },
  start: 17824291
};
