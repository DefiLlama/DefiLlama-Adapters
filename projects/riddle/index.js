const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require("../helper/cache/getLogs");

module.exports = {
  xrplevm: {
    tvl: async (api) => {
      // const xrp = ADDRESSES.GAS_TOKEN_2;
      const wxrp = ADDRESSES.xrplevm.WXRP;
      const factory = "0x4e127808535795C58045e546c4b1554ae4aeF3cD";
      const fromBlock = 1;
      const pairs = await getPairs(api, factory, fromBlock);

      const reserves = await api.multiCall({
        abi: "function getReserves() view returns (uint256, uint256, uint256)",
        calls: pairs,
      });

      reserves.forEach(reserve => {
        const _reserve1 = reserve[2];
        api.add(wxrp, _reserve1);
      });
    }
 }
};

async function getPairs(api, factory, fromBlock) {
  const logs = await getLogs({
    api,
    target: factory,
    eventAbi:
      "event PairCreated(address indexed tokenA, address indexed tokenB, address pair, uint)",
    onlyArgs: true,
    fromBlock,
    topics: [
      "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9",
    ],
  });
  return logs.map((i) => i.pair);
}
