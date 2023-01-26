const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const CVX = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";
const PirexCVX = "0x35A398425d9f1029021A92bc3d2557D42C8588D7";
const CVXLocker = "0x72a19342e8F1838460eBFCCEf09F6585e32db86E";

async function tvl(ts, block, _, { api }) {
  const balances = {};
  const { locked } = await api.call({
    abi: abi.balances,
    target: CVXLocker,
    params: [PirexCVX],
  });

  sdk.util.sumSingleBalance(balances, CVX, locked);

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: "TVL = Total CVX locked in Pirex",
  ethereum: {
    tvl,
  },
};
