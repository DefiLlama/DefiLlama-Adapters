const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const CONFIG = [
  '0x814CC6B8fd2555845541FB843f37418b05977d8d', // instETH
  '0xc4181dC7BB31453C4A48689ce0CBe975e495321c', // inswETH
  '0x36B429439AB227fAB170A4dFb3321741c8815e55', // inankrETH
  '0xfE715358368416E01d3A961D3a037b7359735d5e', // incbETH
  '0x90E80E25ABDB6205B08DeBa29a87f7eb039023C2', // inETHx
  '0x6E17a8b5D33e6DBdB9fC61d758BF554b6AD93322', // inlsETH
  '0xd0ee89d82183D7Ddaef14C6b4fC0AA742F426355', // inmETH
  '0x4878F636A9Aa314B776Ac51A25021C44CAF86bEd', // inoETH
  '0xA9F8c770661BeE8DF2D026edB1Cb6FF763C780FF', // inosETH
  '0x1Aa53BC4Beb82aDf7f5EDEE9e3bBF3434aD59F12', // inrETH
  '0x295234B7E370a5Db2D2447aCA83bc7448f151161', // insfrxETH
  '0xC0660932C5dCaD4A1409b7975d147203B1e9A2B6', // inwbETH
  '0xC6Cc133477f63D9c0C53D1eF7DA83fa250778DB4', // inEIGEN
  '0x016E074Ca7304b815E29A9b9d8CF7a5603DA2A5f', // inBTC
  '0xeFaF124849b11b513C35350CD8643d29DE49c2ba', // insFRAX
]

const symbioticVaults = [
  '0xf9D9F828989A624423C48b95BC04E9Ae0ef5Ec97', // inwstETHs
  '0x06824C27C8a0DbDe5F72f770eC82e3c0FD4DcEc3' // amphrLRT
]

const wstETH = ADDRESSES.ethereum.WSTETH

const eventAbis = {
  deposit: "event Deposit(address indexed sender, address indexed receiver, uint256 amount, uint256 iShares)",
  withdraw:"event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 amount, uint256 iShares)"
}

const tvl = async (api) => {
  for (const vault of symbioticVaults) {
    const depositedLogs = await getLogs({ api, extraKey: `deposited-${vault}`, fromBlock: 20126194, target: vault, eventAbi: eventAbis.deposit, onlyArgs: true })
    const withdrawLogs = await getLogs({ api, extrakey: `withdraw-${vault}`, fromBlock: 20126194, target: vault, eventAbi: eventAbis.withdraw, onlyArgs: true })
    
    depositedLogs.forEach(e => api.add(wstETH, e[2]));
    withdrawLogs.forEach(e => api.add(wstETH, -e[3]));
  }

  return api.erc4626Sum({ calls: CONFIG, tokenAbi: 'address:asset', balanceAbi: 'uint256:getTotalDeposited' })
}


module.exports = {
  ethereum: { tvl },
  doublecounted: true,
  hallmarks: [
    [1714953600, "Genesis Merges with InceptionLRT"],
    [1734530420, "Amphor Labs Merges with InceptionLRT"]
  ],
}
