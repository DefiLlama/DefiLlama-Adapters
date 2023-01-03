const { queryContractStore, getBalance, sumSingleBalance, getDenomBalance, TOKEN_LIST, } = require('../helper/chain/terra')

// taken from https://api.pylon.money/api/gateway/v1/projects/
const pools = [
    "terra1z5j60wct88yz62ylqa4t8p8239cwx9kjlghkg2",
    "terra149fxy4crxnhy4z2lezefwe7evjthlsttyse20m",
    "terra1he8j44cv2fcntujjnsqn3ummauua555agz4js0",
    "terra1xu84jh7x2ugt3gkpv8d450hdwcyejtcwwkkzgv",
    "terra1zxtcxxjqp7c46g8jx0t25s5ysa5qawmwd2w7nr",
    "terra1jk0xh49ft2ls4u9dlfqweed8080u6ysumvmtcz",
    "terra15y9r79wlu8uqvlu3k7vgv0kgdy29m8j9tt9xgg",
    "terra19zn5u7ej083em99was4y02j3yhracnxwxcvmt4",
    "terra15y70slq4l4s5da2etsyqasyjht0dnquj03qm05",
    "terra1g9kzlt58ycppx9elymnrgxmwssfawym668r2y4",
    "terra1he8ymhmqmtuu5699akwk94urap6z09xnnews32",
    "terra1vftcl08p73v3nkuwvv5ntznku44s7p2tq00mgn",
    "terra132u62nsympysvtg3nng5xg6tjf6cr8sxrq7ena",
    "terra1dyattlzq58ty7pat337a9dz6j46thldu5gn8ls",
    "terra1xkw8vusucy9c2w9hxuw6lktxk2w8g72utdyq96",
    "terra1jzsjs8qx9ehsukzea9smuqtfuklmngmeh5csl3"
]

// Pools in https://gateway.pylon.money/
async function tvl() {
    const balances = {}
    for (const pool of pools) {
        const [aUSTBalance, ustcBalance] = await Promise.all([
            getBalance(TOKEN_LIST.anchorust, pool),
            getDenomBalance('uusd', pool),
        ])
        sumSingleBalance(balances, TOKEN_LIST.anchorust, aUSTBalance)
        sumSingleBalance(balances, TOKEN_LIST.terrausd, ustcBalance)
    }

    Object.entries(balances).forEach(([t, v]) => balances[t] = Number(v).toFixed(0))
    return balances
}

async function pool2() {
    const { assets } = await queryContractStore({ contract: 'terra134m8n2epp0n40qr08qsvvrzycn2zq4zcpmue48', queryParam: { "pool": {} } })
    let pylonAmount
    let uusdAmount

    assets.forEach(i => {
        if (i.info.token) pylonAmount = i.amount / 1e6
        else uusdAmount = i.amount / 1e6
    })

    return {
        "pylon-protocol": pylonAmount,
        "terrausd": uusdAmount,
    }
}

async function staking() {
    const { balance } = await queryContractStore({ contract: 'terra1kcthelkax4j9x8d3ny6sdag0qmxxynl3qtcrpy', queryParam: { "balance": { "address": "terra1xu8utj38xuw6mjwck4n97enmavlv852zkcvhgp" } } })
    return {
        "pylon-protocol": balance / 1e6
    }
}

module.exports = {
    timetravel: false,
    methodology: 'TVL counts the UST that has been deposted to the Protocol. Data is pulled from the Pylon API:"https://api.pylon.money/api/launchpad/v1/projects/mine".',
    terra: {
        pool2,
        staking,
        tvl
    },
     hallmarks:[
    [1651881600, "UST depeg"],
  ]
}
