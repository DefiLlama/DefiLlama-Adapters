const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const minterGateway = '0xf7f9638cb444d65e5a40bf5ff98ebe4ff319f04e'
const eventAbi = 'event CollateralUpdated(address indexed minter, uint240 collateral, uint240 totalResolvedCollateralRetrieval, bytes32 indexed metadataHash, uint40 timestamp)'
const abi = 'function collateralOf(address minter_) view returns (uint240)'

const tvl = async (api) => {
  const logs = await getLogs2({ api, target: minterGateway, eventAbi, fromBlock: 19818447 })
  const minters = [...new Set(logs.map(log => log[0]))];
  const collateralOf = await api.multiCall({ calls: minters.map((m) => ({ target: minterGateway, params: [m]})), abi })
  api.add(ADDRESSES.ethereum.USDC, collateralOf)
}

module.exports = {
  methodology: "TVL corresponds to the value minted by an institution by depositing short-term T-bills",
  ethereum: { tvl }
}