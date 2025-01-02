const { nullAddress, sumTokens2 } = require("../helper/unwrapLPs");
const { get } = require("../helper/http");

const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
let _res;

async function getData() {
  if (!_res) _res = await get('https://universe.staderlabs.com/common/tvl', { headers })
  return _res;
}

async function hbarTvl() {
  const res = await get('https://universe.staderlabs.com/common/tvl', { headers })
  return { "hedera-hashgraph": res.hedera.native };
}

async function maticTvl() {
  const res = await getData();
  return { "matic-network": res.polygon.native };
}

async function bscTvl() {
  const res = await getData();
  return { binancecoin: res.bnb.native };
}

async function ethTvl(api) {
  return await api.call({ abi: "uint256:totalAssets", target: "0xcf5ea1b38380f6af39068375516daf40ed70d299" });
}

module.exports = {
  timetravel: false,
  methodology: "We aggregated the assets staked across Stader staking protocols",
  /*terra: { tvl },*/
  hedera: { tvl: hbarTvl },
  // its on ethereum because funds are locked there
  //  ethereum: { tvl: maticTvl },
  fantom: { tvl: () => ({}) },
  terra2: { tvl: () => ({}) },
  bsc: { tvl: bscTvl },
  near: { tvl: () => ({}) },
  ethereum: {
    tvl: async (api) => {
      const res = await getData();
      const nodeOperatorRegistry = "0x4f4bfa0861f62309934a5551e0b2541ee82fdcf1";
      const nodeOperatorCount = await api.call({
        abi: "uint256:totalActiveValidatorCount",
        target: nodeOperatorRegistry,
      });

      const SDCollateralPoolAddress =
        "0x7Af4730cc8EbAd1a050dcad5c03c33D2793EE91f";
      const SDTokenAddress = "0x30D20208d987713f46DFD34EF128Bb16C404D10f";

      const sdBalance = await api.call({
        abi: "erc20:balanceOf",
        target: SDTokenAddress,
        params: SDCollateralPoolAddress,
      });

      const SDToEth = await api.call({
        abi: "function convertSDToETH(uint256) view returns (uint256)",
        target: SDCollateralPoolAddress,
        params: [sdBalance],
      });

      const balances = {
        "matic-network": res.polygon.native,
        [nullAddress]:
          +SDToEth + +(await ethTvl(api)) + +nodeOperatorCount * 4 * 1e18, // 4 ETH per node operator
      };
      return sumTokens2({
        api,
        balances,
        owner: nodeOperatorRegistry,
        tokens: [nullAddress],
      });
    },
  },
  hallmarks: [[1651881600, "UST depeg"]],
};
