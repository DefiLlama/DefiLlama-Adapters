const ADDRESSES = require('../helper/coreAssets.json')
const targets = [
  '0x6DfbE3A1a0e835C125EEBb7712Fffc36c4D93b25', // eigenPos1
  '0x021180A06Aa65A7B5fF891b5C146FbDaFC06e2DA', // eigenPos2
  '0x52EA8E95378d01B0aaD3B034Ca0656b0F0cc21A2', // karakPos
  '0x919531146f9a25dfc161d5ab23b117feae2c1d36', // symbioticPos
]

const mETH = ADDRESSES.ethereum.METH
const boringVault = '0x33272D40b247c4cd9C646582C9bbAD44e85D4fE4'
const delayedWithdraw = '0x12be34be067ebd201f6eaf78a861d90b2a66b113'

const abi = "function getUnderlyings() view returns (address[] assets, uint256[] amounts)"

const tvl = async (api) => {
  const allocateds = await api.multiCall({ calls: targets, abi })
  allocateds.forEach(({ assets: [asset], amounts: [amount] }) => api.add(asset, amount));
  return api.sumTokens({ tokens: [mETH], owners: [boringVault, delayedWithdraw] })
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL corresponds to the sum of mETH deposited across various restaking protocols + the funds pending withdrawal or deposit',
  ethereum: { tvl }
}
