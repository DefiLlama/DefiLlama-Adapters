const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')

const staticAddresses = [
    'bc1p0tr3dgulgpx43dkktjxy8z2azz6yvx4j7s0lelj67tlwct0wnqtqeakfer',
    '14ejzLtUSMsjZE8Pp2LUhX3Pf7BbXPeZyP',
    'bc1q0hapsvdtqfeyw9fjacey9350k8zu552p0khyhj',
    'bc1pr6pga0d44xm3t8z36qnya6sfznsm8fwkn507x6gqt86xtnvm4h4sj2zqus',
    'bc1qy4pkldj4dqxtqypz6awwj7y8vahkht8uqhdlw3'
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