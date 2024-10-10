const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')

const staticAddresses = [
    'bc1p0tr3dgulgpx43dkktjxy8z2azz6yvx4j7s0lelj67tlwct0wnqtqeakfer',
    '14ejzLtUSMsjZE8Pp2LUhX3Pf7BbXPeZyP'
]

const abi = {
    getCustodyAddrInfo: "function getCustodyAddrInfo() view returns (tuple(string mark, string btcAddr)[])"
}

async function tvl() {
    const api = new sdk.ChainApi({ chain: 'ethereum' })

    const addrInfos = await api.call({
        abi: abi.getCustodyAddrInfo,
        target: '0x9F836f8A27F1579258388BFab16ab16E278B1a2C'
    })

    const btcAddresses = addrInfos.map(info => info.btcAddr)

    btcAddresses.forEach(addr => staticAddresses.push(addr))

    return sumTokens({ owners: staticAddresses })
}

module.exports = {
    timetravel: false,
    bitcoin: {
        tvl,
    }
}