const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = require("../helper/abis/morpho.json");

const contract = "0xde6e08ac208088cc62812ba30608d852c6b0ecbc"
const fromBlock = 23214670

async function tvl(api) {
  return sumTokens2({ tokens: ["0xd4fa2d31b7968e448877f69a96de69f5de8cd23e"], owner: contract, api })
}

const eventAbis = {
  createMarket: 'event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv, address creditLine) marketParams)'
}

async function borrowed(api) {
  const logs = await getLogs({ api, target: contract, eventAbi: eventAbis.createMarket, fromBlock, onlyArgs: true })
  const markets = logs.map((i) => i.id.toLowerCase())
  const marketInfos = await api.multiCall({ target: contract, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const marketDatas = await api.multiCall({ target: contract, calls: markets, abi: abi.morphoBlueFunctions.market })
  
  marketDatas.forEach((data, idx) => {
    const { loanToken } = marketInfos[idx];
    api.add(loanToken, data.totalBorrowAssets);
  });
}

module.exports = {
  methodology: `We count the tokens on ${contract}`,
  ethereum: {
    tvl,
    borrowed,
  }
}
