const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

async function tvl(api) {

  // Get total deposits in the protocol
  const totalDeposits = await api.call({ target: "0x9b6761bf2397Bb5a6624a856cC84A3A14Dcd3fe5", abi: 'uint256:deposits', })
  // Add BERA balance to TVL
  // Using null address for native token (BERA)
  api.add(ADDRESSES.null, totalDeposits)


  const logs = await getLogs2({ api, factory: '0xb71b3DaEA39012Fb0f2B14D2a9C86da9292fC126', eventAbi: 'event NewVault (address _sender, address indexed _asset, address indexed _vault)', fromBlock: 562092, })
  const vaults = logs.map(log => log._vault)
  const assets = await api.multiCall({ abi: 'address:stakingToken', calls: vaults })
  const balances = await api.multiCall({ abi: 'uint256:totalSupply', calls: vaults })
  api.add(assets, balances)
}

module.exports = {
  doublecounted: true,
  berachain: {
    tvl
  },
}