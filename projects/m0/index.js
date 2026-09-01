const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const minterGateway = '0xf7f9638cb444d65e5a40bf5ff98ebe4ff319f04e'
const eventAbi = "event MinterActivated(address indexed minter, address indexed caller)"
const abi = 'function collateralOf(address minter_) view returns (uint240)'

const tvl = async (api) => {
  const logs = await getLogs2({ api, target: minterGateway, eventAbi, fromBlock: 19818447, extraKey: 'MinterActivated' })
  const minters = [...new Set(logs.map(log => log.minter))];
  const collateralOf = await api.multiCall({ target: minterGateway, calls: minters, abi })
  api.add(ADDRESSES.ethereum.USDC, collateralOf)
}

module.exports = {
  misrepresentedTokens: true,  // the project doesnt actually hold USDC
  methodology: "TVL corresponds to the value minted by an institution by depositing short-term T-bills",
  ethereum: { tvl }
}