const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const BigNumber = require('bignumber.js')

const bsc_dashboard = "0x1ac6C0B955B6D7ACb61c9Bdf3EE98E0689e07B8A"
const bsc_pools = [
    "0xe9b3017cd7a347a8b0324f88db335255e5c5d3fd",
    "0x8b06b41c78a5521e882ca1cac10777c6831b203f",
    "0x54f4D5dd6164B99603E77C8E13FFC3B239F63147",
    "0x5c0e7b820fcc7cc66b787a204b2b31cbc027843f",
    "0x637954736ed4cb0adf1e636838d2789dedb5113c",
    "0x030970f2378748eca951ca5b2f063c45225c8f6c",
    "0x0d5bae8f5232820ef56d98c04b8f531d2742555f",
    "0x27DD6E51BF715cFc0e2fe96Af26fC9DED89e4BE8",
    "0x025e2e9113dc1f6549c83e761d70e647c8cde187",
    "0x9009A831FD7469aE9d4a07250cBBae05c2b5C165",
    "0xc955bdf243538b60c1f7e8ce2acbf0c314bd8586",
    "0x176ddf98df57e6535ce635cf908216112fc67b3b",
    "0x1a489ee9ccd2f062f86361fb7af9dac9293864bc",
    "0xc9034e3e14118411a8b9cb19a6c5bf66147adedf",
    "0xc7510D6baB5904E1898b15906dBe63c0C111918c",
    "0x4ed4e91862559c49656e9583f83dd085ce724d1a",
    "0xe5b870d22c2132c1d3c0fd8ff175c6213057406d",
    "0xdbeac4d4568d6ef96dab004ae746bfad037d23ee",
    "0x8e46ACE8e4F6d4Fdf5811cd04b39477C732C180a",
    "0xb225a38b71933482c4e7954701992ad386432e99",
    "0x9f98a5466309ea2d9f984efad401e75ed9fff764",
    "0x76fa69c64341ef9ae32995919700cd1f1bbdc799",
    "0xc354902b5e2028df62495819ce49846b1de4070f",
    "0x0883ae231ff031b06ec8548e5d899c4309890986",
    "0xf2b5230d23e80742d69623d51108fdd4af68d4d0",
    "0xe941e79b8614ab48138ab4cfb9f674367cdc3cbc",
    "0xcabc4a6e6cd7253665ac7a769bb68156f5da828e",
    "0x5108cb8c156aebbc0f9063d035fac3d5956f835a",
    "0x4193f8f3b7ec05ec296ed4bf96752fa16b6b3c34",
    "0x4747aa95AB3bd8E7a2dc2b7088A290BE71aa96E7",
    "0xfdf42dbebb4e6f6ca13020396b61ee46e694cb6b",
    "0xb0571a663f36f11142b21fe146beb2777031bc0b",
    "0x7537fd53a07ca58561bb8a0d370a8d8b70661647",
    "0x6218203d8e7867bfd67d51985c335a3cb414b491",
    "0xdda07283e23e8d6fcfec5b1f8df293909e193016",
    "0x1ce5d873c360bc733cd50f842a35d55414a64c7c",
    "0x26358225733088707081b39117AfcB7F15fd58fF",
    "0xca5fe76131123eac494088fe1770ff6ecb09df8c",
    "0xf85759c595d380ec8694de525c28574f16b1f5d4",
    "0x42D6855799eFC79188e06e80a5704e1Cef40DBf5",
    "0xabf6ec9f9b4a5f473b67b5272f096795c32ea762",
    "0xfd3912EAB0fE94Fa99F69c7dF33bB9252803487b",
    "0x40A5ef990864328F8fe22B5FD04bDC90E4604a84",
    "0x081d365008eea51b1b9f78f81e3a35e124d53ba7",
    "0x77e3D9c047b4D21fCB91509e0A0a85Bc057eb18a",
    "0x251FC294eC0e3d2d82Df70cc9271eE60E4Ae76e0",
    "0xc8d3ad71ba1d7eb0a234c6107567b99dc0b71ba1",
    "0x59080883c277209a12bb590f56fd692dafad2c9c",
    "0x5321770054913c9a0368a8da0e733359343d78eb",
    "0x6fe829ba0830394eaa23b2ba6415dafca7c7d491",
    "0xab4d07545833f7105235231698d4ae9a65494a07",
    "0xba3a43bffb3eb0d141b5b399ee7682e62e19b658",
    "0xbd4f9bfc08f2fcde14a795fb2fac7982ca378dcd",
    "0xe050acc68c778b6f7f63bdfecdec576fcc6d2274",
    "0xe6fbc3e4e20f30f1250febe3e985b308380c7ed0",
    "0x768becbc0f490e2eb9d731bf158b8eaab28a401f",
    "0x0580daab7ab6d792786f0feed80bd8c8cde65938",
    "0x787ded9f1465e93cff85de8d407e44e51bb52b54",
    "0x483626122b250409fe0fa1098cb6abb26a0ba613",
    "0xaa86c6990c532a37a0c7b4eda418abfd4aecac61",
    "0xb084ef6ba200fba55367bf94ec672b4687c036b2",
    "0x94fcc63a8821bdf802d12c783c2df69d5cd78f9d",
    "0x631a4e92cdb80d7f8e7c9073f0292ba9432bca30",
    "0xc9b8ab5561d95c54ad51f1b6cefff0660026e3f1",
    "0xb89c254010a3345fca9f15f77a8242391569ac39",
    "0xa26a2c4da2b3c1e707712fdb4a7148d05441a3ed",
    "0xe7d709c8aabd5c67652bb3166eaa972a68331344",
    "0x8d6250dfba37fd083a1275b58ec286e46028e4d6",
    "0x1013350B1e0215F654E8e46972F84e2B2874A800",
    "0x2adf8e06993e8723464981e6e472c0a819912d4e",
    "0xf8cc41bf5b3dfb569d06b84cd2edfc76d4fbe913",
    "0x21295a0163599b3e8a70dacefa478bb55d44947b",
    "0x400f5446653b9554e6b3280146c96f27e91f5cd6",
    "0xcee9b83e0994f4f56c5fe6a6f20493679bd27818",
    "0xbc66934128d60cf0e47f2be7b7e3deeb19ce92e3",
    "0x0c1c5dbe7cc26da3927fe7f37c5760e3686f370d",
    "0x58D25A7e34eE8fA7A070510e6D2E0096Ed62c828",
    "0x0A33E8e887850Ad53739A0CeF110283b74E02f3e",
    "0x2ab4b226c08b8ecf4a54e0a4ed965c678188aa91",
    "0x37e54cfe5a6ed9224300d9839896c1dfa1828124",
    "0x4101cea7ddc92ab53938a14e6b8ee1516640054d",
    "0x88094d75d1be902e7650cdb34f66b1852b896fc5",
    "0x8f15bd33c51fa54e9e0925dd4aae789aff9b28e5",
    "0x61079517c5a7c66d8e9f337d5839f0976e9afda0",
    "0x8678e37e10a3ee45a87fa052513ce12878a990b1",
    "0x7c4294cbde222cf679dd059b35b517453580b195",
    "0x59b99da89de72130e624d60644fe9585dbe98f93",
    "0x06683f660007a0875f40f7d2d1ded37c30a04378",
    "0x2a6f28aebf729f114f6d7728244914204d69bd44",
    "0x50a67d1a6b2acd18bf3869457949cfd3b38cdd7c",
    "0x96cba0ee10841c244357ea7b1292a4bbcb4a5fb2",
    "0x88c9b5f8bf319156499520a46cb7b5ad8efaa151",
    "0x92cf8c13096b246fffc114d1e39cf13e26b3e537",
    "0x000d6f296c41905f221ac4863baa0f5d2b8e9f08",
    "0xb7194eea1cafe93aa3bf33f44c2787c551c314e3",
    "0x84898845e6bef725ada3367350891c374d837076",
    "0x2cd96e186a4d57687b445ecfb1ed9ccd1d5f9d72",
    "0xdfa04c6a71e9584e7103cc0bf664fbea45377cc6",
    "0xd64d92b8c9dc9b0119da885a7fd7036da5cd65b1",
    "0x0f2e64cfd59670716bc69e940108764281d45d74",
    "0x423bb4bef374da4ea7654230edf10a0ac94984b0",
    "0x8910c3c650b611fd25930f9f57acf7a3dcba17ba",
    "0x2d67c46fd98a475ea6065c8d72d68b1cb71adb0a",
    "0x0412d1e65b2bc1c2739a0e06ae2ed9584d92b867",
    "0x4c9518936f979b694303e1c279a61cbbd2571de5",
    "0xfdb0d13aeeaf50d8dd602168f16f428e740b2af3",
    "0x3651ecb8de44c255e37ecb571f52095225342d6a",
    "0xe4fedf6c2793b185f3f3b76f1c946e72eba2c987",
    "0xe9f6594b0299f3a097414d696884cedebf4e1684",
    "0x1190f6c71584168f2c14db98a4f9ecae1f1b269c",
    "0x2a23a24fa4da825f0622fd4369b16a3cf6ca7052",
    "0x0c044c0344b2fc2f155c93313307df187de0b98c",
    "0x53a31e5bfa7b40243df3aecb7158beb99d853777",
    "0xeda8986d2df3d0626c93fd7cbd84e2a6b6dbbf32",
    "0x40293dbe472dcc8da5ff63988376d4199fb97287",
    "0xd3ae5ede9e3efd34ac859743ca1964d85cab097b",
    "0x313ece8be11cab51e8fd730740f4e0f035b32cd5",
    "0xb6e754db11fba321c1e27d449677177fb0024d1f",
    "0x0aac7f59c8c2605b649fa9de127bc77d13222f57",
    "0x2b65d7653c2d66d130ab59a65df04250e071c621",
    "0xae663b34779074a3ac54149b0990d14b589269d9",
    "0x010d7c8d616eee6dc878c6aab5c47aa6f84c0c23",
    "0x2465fedeac581418e08d9fbfb6d987d0817f5c16"
]

const polygon_dashboard = "0xD109D9d6f258D48899D7D16549B89122B0536729"
const polygon_pools = [
    "0x39cf6bd2671798d482578ce4407ba5f64f87803d",
    "0x162da44709810dcb8b886b60d9b3d0b105a77946",
    "0xc74968693a829ca04f49e741285a0be831fac5f7",
    "0xaa6bca49f7842823312b0d90b4e1e336a7dbf892",
    "0xc5e165c4da919448889e4ddf625e56641a340dab",
    "0x90fca6d7931b4fecae00c3dd864304ac8848ff7a",
    "0xa599e42a39dea9230a8164dec8316c2522c9ccd7",
    "0xde2ab86cc044a2905917f3123ad5b833b363298a",
    "0x3856f4e61f5b28fee2fbf322fc03a03afb930f4f",
    "0xb29425f706ea716c91a2ae68ee883c6a6791938b",
    "0x60c9d693cbe45df09327a46f0792f821cd58a438",
    "0x299fa358763037657bea14825cd06ff390c2a634",
    "0x38e5c26f7bec4e5966061a1bb13b656999f91c65",
    "0xf4051fdd819c580e4c03ff73cff9a6d9f29bd48d",
    "0x873ba405abd1cdc561499097f03e08ccc054ecf8",
    "0x5c95b6c16df69e97d5aec4cfefbb1200847d7101",
    "0x52b8bb74cde6602ab9e6540e25e0a97f5b3226d7",
    "0x198265ff748dae52a6c58cee1a91e1457ef957ef",
    "0xd7c5a3cba73d4c9f042f88928d1cd64b64e76a50",
    "0x47f9f157317e7e655df30e013ce14730d224d4e5",
    "0x5f2b2518616907a5f76f25e9e2b67a571879c610"
]

const ZERO = new BigNumber(0)
const ETHER = new BigNumber(10).pow(18)

async function tvl(timestamp) {
    const { bsc_block } = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'bsc'
    })
    const bsc_total = (await sdk.api.abi.multiCall({
        calls: bsc_pools.map( address => ({
            target: bsc_dashboard,
            params: address
        })),
        bsc_block,
        abi: abi,
        chain: 'bsc'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)

    const { polygon_block } = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'polygon'
    })
    const polygon_total = (await sdk.api.abi.multiCall({
        calls: polygon_pools.map( address => ({
            target: polygon_dashboard,
            params: address
        })),
        polygon_block,
        abi: abi,
        chain: 'polygon'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)

    return {
        'tether': bsc_total.plus(polygon_total).dividedBy(ETHER).toString()
    }
}

module.exports = {
    tvl
}
