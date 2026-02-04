const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "underlierToken": "address:underlierToken",
    "underlierScale": "uint256:underlierScale",
    "token": "address:token",
    "tokenScale": "uint256:tokenScale",
    "fairPrice": "function fairPrice(uint256, bool net, bool face) view returns (uint256)",
    "balanceOf": "function balanceOf(address account, uint256 id) view returns (uint256)"
  };const { sumTokens2, } = require("../helper/unwrapLPs")
const { getConfig } = require('../helper/cache')


const STAKING_CONTRACT = "0xe98ae8cD25CDC06562c29231Db339d17D02Fd486"
const STAKING_NFT = "0xE9F9936a639809e766685a436511eac3Fb1C85bC"
const RGT = "0xD291E7a03283640FDc51b121aC401383A46cC623"
const YFI = ADDRESSES.ethereum.YFI
const MKR = ADDRESSES.ethereum.MKR
const BOND = "0x0391D2021f89DC339F60Fff84546EA23E337750f"
const UMA = "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828"
const WSOHM = "0xca76543cf381ebbb277be79574059e32108e3e65"
const WSOHM_FDT_SLP = "0x2e30e758b3950dd9afed2e21f5ab82156fbdbbba"
const FDT_GOHM = "0x75b02b9889536B617d57D08c1Ccb929c523945C1"

// Protocol TVL
async function tvl(api) {

  // Launch Ceremony
  await sumTokens2({ api, owners: [STAKING_CONTRACT, STAKING_NFT], tokens: [RGT, YFI, MKR, BOND, UMA, WSOHM_FDT_SLP, FDT_GOHM,], resolveLP: true })
  const wsOHMBal = await api.call({  abi: 'erc20:balanceOf', target: WSOHM, params: STAKING_CONTRACT })
  api.add('0x0ab87046fbb341d058f17cbc4c1133f25a20a52f', wsOHMBal)

  const metadata = (await getConfig('fiatdao', 'https://raw.githubusercontent.com/fiatdao/changelog/main/metadata/metadata-mainnet.json'))
  const allVaults = Object.keys(metadata)
  const tokensAll = await api.multiCall({ abi: abi.token, calls: allVaults, })
  const tokens = []
  const vaults = []

  tokensAll.forEach((output, i) => {
    if (output !== ADDRESSES.null) {
      vaults.push(allVaults[i])
      tokens.push(output)
    }
  })

  const tokenScales = await api.multiCall({ abi: abi.tokenScale, calls: vaults, })
  const underliers = await api.multiCall({ abi: abi.underlierToken, calls: vaults, })
  const underlierScales = await api.multiCall({ abi: abi.underlierScale, calls: vaults, })

  const erc20Metadata = []
  const erc1155Metadata = []

  underliers.forEach((token, i) => {
    const underlier = token
    const vault = vaults[i]
    const scale = underlierScales[i] / (tokenScales[i] * 1e18)
    metadata[vault].tokenIds.forEach(id => {
      if (id === '0') {
        erc20Metadata.push({ vault, scale, underlier, tokenCall: { target: tokens[i], params: vault }, priceCall: { target: vault, params: [0, false, false] } })
        return;
      }
      erc1155Metadata.push({ vault, scale, underlier, tokenCall: { target: tokens[i], params: [vault, id] }, priceCall: { target: vault, params: [id, false, false] } })
    })
  })

  const erc20Balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: erc20Metadata.map(i => i.tokenCall), })
  const erc20Prices = await api.multiCall({ abi: abi.fairPrice, calls: erc20Metadata.map(i => i.priceCall), })
  const erc1155Balances = await api.multiCall({ abi: abi.balanceOf, calls: erc1155Metadata.map(i => i.tokenCall), permitFailure: true})
  const erc1155Prices = await api.multiCall({ abi: abi.fairPrice, calls: erc1155Metadata.map(i => i.priceCall), permitFailure: true })

  erc20Balances.forEach((output, i) => {
     api.add(erc20Metadata[i].underlier, erc20Metadata[i].scale * output * erc20Prices[i])
  })

  erc1155Balances.forEach((output, i) => {
    if (!output || !erc1155Prices[i]) {
      return;
    }
    api.add(erc1155Metadata[i].underlier, erc1155Metadata[i].scale * output * erc1155Prices[i])
  })

}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL includes fair value of collateral backing outstanding $FIAT and the initial FDT Jubilee event',
  ethereum: { tvl },
  hallmarks: [
    [1635959960, "FDT Jubilee starts"],
    [1639380013, "FDT Jubilee ends"],
    [1649604096, "Protocol Launch"]
  ]
}
