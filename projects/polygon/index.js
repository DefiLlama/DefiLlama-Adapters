const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, block) {
    const etherAddress = ADDRESSES.null

    const posEtherPredicate = '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30'
    const posERC20Predicate = '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf'
    const plasmaDepositManager = '0x401F6c983eA34274ec46f84D70b31C151321188b'

    const maticToken = ADDRESSES.ethereum.MATIC
    const stakeManager = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908'

    const toa = [
        [etherAddress, posEtherPredicate]
    ]

    const erc20Tokens = [
        ADDRESSES.ethereum.MATIC,
        ADDRESSES.ethereum.DAI,
        '0x3F382DbD960E3a9bbCeaE22651E88158d2791550',
        ADDRESSES.ethereum.AAVE,
        ADDRESSES.ethereum.LINK,
        '0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d',
        ADDRESSES.ethereum.CRV,
        '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
        '0xba100000625a3754423978a60c9317c58a424e3d',
        '0x4b520c812e8430659fc9f12f6d0c39026c83588d',
        '0xb6ee9668771a79be7967ee29a63d4184f8097143',
        '0xa51fc71422a30fa7ffa605b360c3b283501b5bf6',
        '0x4f81c790581b240a5c948afd173620ecc8c71c8d',
        '0x56d811088235F11C8920698a204A5010a788f4b3',
        '0xcfcecfe2bd2fed07a9145222e8a7ad9cf1ccd22a',
        // '0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3',
        ADDRESSES.ethereum.USDC,
        '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.USDT,
        '0xe0cca86b254005889ac3a81e737f56a14f4a38f5',
        '0x09617f6fd6cf8a71278ec86e23bbab29c04353a7',
        '0xd2ba23de8a19316a638dc1e7a9adda1d74233368',
        '0x99fe3b1391503a1bc1788051347a1324bff41452',
        '0x9534ad65fb398e27ac8f4251dae1780b989d136e',
        '0xee1edd77f16b7867e026a4d32ef45dac852da61f',
        '0x467Bccd9d29f223BcE8043b84E8C8B282827790F',
        '0x16eccfdbb4ee1a85a33f3a9b21175cd7ae753db4',
        '0x0335a7610d817aeca1bebbefbd392ecc2ed587b8',
        '0xcc4ae94372da236e9b113132e0c46c68704246b9',
        ADDRESSES.ethereum.TUSD,
        '0xff56cc6b1e6ded347aa0b7676c85ab0b3d08b0fa',
        '0x0a6e18fb2842855c3af925310b0f50a4bfa17909',
        '0x8ffe40a3d0f80c0ce6b203d5cdc1a6a86d9acaea',
        '0x9695e0114e12c0d3a3636fab5a18e6b737529023',
        '0xC581b735A1688071A1746c968e0798D642EDE491',
        '0xe912b8bA2513D7e29b7b2E5B14398dbf77503Fb4',
        '0xba8a621b4a54e61c442f5ec623687e2a942225ef',
        '0x249e38ea4102d0cf8264d3701f1a0e39c4f2dc3b',
        ADDRESSES.ethereum.FRAX,
        '0xd0cd466b34a24fcb2f87676278af2005ca8a78c4',
        '0x3a4f40631a4f906c2BaD353Ed06De7A5D3fCb430',
        '0xba100000625a3754423978a60c9317c58a424e3d',
        '0x888888435fde8e7d4c54cab67f206e4199454c60',
        '0x8b3870df408ff4d7c3a26df852d41034eda11d81',
        '0xb705268213d593b8fd88d3fdeff93aff5cbdcfae',
        '0xdb25f211ab05b1c97d595516f45794528a807ad8',
        ADDRESSES.ethereum.UNI,
        '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
        '0x3593d125a4f7849a1b059e64f4517a86dd60c95d',
        '0x6f40d4a6237c257fff2db00fa0510deeecd303eb',
        ADDRESSES.ethereum.LIDO,
        '0xb4d930279552397bba2ee473229f89ec245bc365',
        '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f',
        '0x544c42fbb96b39b21df61cf322b5edc285ee7429',
        '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b',
        '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
        '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
        '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0',
        '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd',
        '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
        '0xa47c8bf37f92abed4a126bda807a7b7498661acd',
        '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
        '0x111111517e4929d3dcbdfa7cce55d30d4b6bc4d6',
    ]
    erc20Tokens.map(i => {
        toa.push([i, posERC20Predicate])
    })
    toa.push([maticToken, plasmaDepositManager])
    toa.push([maticToken, stakeManager])
    return sumTokens2({ block, tokensAndOwners: toa, })
}

module.exports = {
    start: 1590824836, // Sat May 30 13:17:16 2020
    polygon: {
        tvl
    }
}
