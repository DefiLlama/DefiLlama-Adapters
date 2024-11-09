const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const abi = {
    getCustodyAddrInfo: "function getCustodyAddrInfo() view returns (tuple(string mark, string btcAddr)[])"
}

async function tvl() {
    const api = new sdk.ChainApi({ chain: 'ethereum' })
    const addrInfos = await api.call({abi: abi.getCustodyAddrInfo, target: '0x9F836f8A27F1579258388BFab16ab16E278B1a2C' })
    const btcAddresses = addrInfos.map(info => info.btcAddr)
    btcAddresses.forEach(addr => bitcoinAddressBook.obelisk.push(addr))
    return sumTokens({ owners: bitcoinAddressBook.obelisk })
}

module.exports = {
    timetravel: false,
    bitcoin: { tvl }
}