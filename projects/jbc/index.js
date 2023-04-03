const BigNumber = require("bignumber.js");
const { toUSDTBalances, } = require("../helper/balances");
let stakedLpAddress = "0x85c6da933a7451bf2a6d836304B30967F3E76e11";
let gmxVaultAddress = "0x489ee077994B6658eAfA855C308275EAd8097C4A";
let minPriceAbi = "function getMinPrice(address _token) view returns (uint256)";
let stakedContractAddress = "0x1939A441D006bD74a0034891972fa25789Af7A24";
let arbEthLpAddress = "0x39511b74722afE77d532Eb70632B4B59C559019b";
let wEthAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
let arbAddress = "0x912CE59144191C1204E64559FE8253a0e49E6548";
const Abi = require("./abi.json");
const getReserves = "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)";

const lendInfos = [
  ["0x1F01d43E994C5d009Bd50F7c68EdF04f8966135F", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", "18"],
  ["0xAfC888621Ad39Ff6B54C2F6168DDCE8152de314B", "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "8"],
  ["0xE1308Ada37C64bDfC3F9547af945F524E968c549", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", "6"],
  ["0x0411fED8A22191a3F9e94FD7a159230D9A3888AC", "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", "6"],
  ["0xd323d188d787CDa4c5f3D2BBC087d1149F72F322", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", "18"],
  ["0x8EAF69Ea32024246d3E8F869602ce7F0fE3a214C", "0x912CE59144191C1204E64559FE8253a0e49E6548", "18"]
];

function fetchTvl() {
  return async (timestamp, block, chainBlocks, { api }) => {
    const stakedTvl = await getStakeTvl(timestamp, block, chainBlocks, { api });
    const lendTvl = await getLendTvl(timestamp, block, chainBlocks, { api });
    const totalTvl = stakedTvl.dividedBy(1e18).plus(lendTvl);

    return toUSDTBalances(totalTvl.dividedBy(1e18).toFixed(2));
  };
}

const getLendTvl = async (timestamp, block, chainBlocks, { api }) => {
  const lendTvls = await Promise.all(
    lendInfos.map(async ([vault, asset, decimals]) => {
      const totalShareBal = (await api.call({ abi: Abi.totalShareBal, target: vault, }))

      let price = new BigNumber(0);
      if (asset !== arbAddress) {
        price = (await api.call({ abi: minPriceAbi, target: gmxVaultAddress, params: [asset], }));
      } else {
        price = await getArbPrice(timestamp, block, chainBlocks, { api });
      }
      const totalShareBal18 = new BigNumber(totalShareBal).times(new BigNumber(Math.pow(10, 18 - Number(decimals)).toString()));
      const price18 = new BigNumber(price).dividedBy(1e12);
      const tvl = new BigNumber(totalShareBal18).times(price18).dividedBy(1e18);
      return tvl;
    })
  );
  let tatalTvl = new BigNumber("0");
  for (const lendTvl of lendTvls) {
    tatalTvl = tatalTvl.plus(lendTvl);
  }

  return tatalTvl;
};

const getStakeTvl = async (timestamp, block, chainBlocks, { api }) => {

  const [totalShareBal, [balance0, balance1], supply, price] = await Promise.all([
    api.call({ abi: Abi.totalShareBal, target: stakedContractAddress, }),
    api.call({ abi: getReserves, target: stakedLpAddress, }),
    api.call({ abi: Abi.totalSupply, target: stakedLpAddress, }),
    api.call({ abi: minPriceAbi, target: gmxVaultAddress, params: [wEthAddress], })
  ]);

  const price18 = new BigNumber(price).dividedBy(1e12);

  const stakedTvl = new BigNumber(totalShareBal).times(2).times(new BigNumber(balance0)).times(price18).dividedBy(new BigNumber(supply));

  return stakedTvl;
};

const getArbPrice = async (timestamp, block, chainBlocks, { api }) => {
  const [balance0, balance1] = (await api.call({ abi: getReserves, target: arbEthLpAddress, }));

  const price = (await api.call({ abi: minPriceAbi, target: gmxVaultAddress, params: [wEthAddress], }));
  const price18 = new BigNumber(price).dividedBy(1e12);

  const arbPrice = new BigNumber(balance0).times(price18).dividedBy(new BigNumber(balance1)).times(1e12);

  return arbPrice;
};

module.exports = {
  arbitrum: {
    tvl: fetchTvl()
  }
};

