const ADDRESSES = require('../helper/coreAssets.json');

const STRATEGIES = {
  "AutoCompounding": [{ // auto-compounds user tokens (e.g. STRK) by investing in zkLend
    address: "0x00541681b9ad63dff1b35f79c78d8477f64857de29a27902f7298f7b620838ea", // STRK Auto-compounding
    token: ADDRESSES.starknet.STRK
  }, {
    address: "0x016912b22d5696e95ffde888ede4bd69fbbc60c5f873082857a47c543172694f", // USDC Auto-compounding
    token: ADDRESSES.starknet.USDC
  }],
  "Sensei": [{ // strategy using delta neutral looping across zklend and nostra protocols
    address: "0x020d5fc4c9df4f943ebb36078e703369c04176ed00accf290e8295b659d2cea6", // STRK Sensei
    token: ADDRESSES.starknet.STRK,
    zToken: '0x06d8fa671ef84f791b7f601fa79fea8f6ceb70b5fa84189e3159d532162efc21'
  }, {
    address: "0x04937b58e05a3a2477402d1f74e66686f58a61a5070fcc6f694fb9a0b3bae422",
    token: ADDRESSES.starknet.USDC, // USDC Sensei
    zToken: '0x047ad51726d891f972e74e4ad858a261b43869f7126ce7436ee0b2529a98f486'
  }, {
    address: "0x9d23d9b1fa0db8c9d75a1df924c3820e594fc4ab1475695889286f3f6df250",
    token: ADDRESSES.starknet.ETH, // ETH Sensei
    zToken: '0x1b5bd713e72fdc5d63ffd83762f81297f6175a5e0a4771cdadbc1dd5fe72cb1'
  }, {
    address: "0x9140757f8fb5748379be582be39d6daf704cc3a0408882c0d57981a885eed9",
    token: ADDRESSES.starknet.ETH, // ETH Sensei XL
    zToken: '0x057146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8'
  }],
  "xSTRKStrats": [{
    address: "0x7023a5cadc8a5db80e4f0fde6b330cbd3c17bbbf9cb145cbabd7bd5e6fb7b0b",
    token: ADDRESSES.starknet.STRK,
    xSTRK: ADDRESSES.starknet.XSTRK,
    vesu: "0x000d8d6dfec4d33bfb6895de9f3852143a17c6f92fd2a21da3d6924d34870160"
  }],
  "FusionVaults": [{
    address: "0x07fb5bcb8525954a60fde4e8fb8220477696ce7117ef264775a1770e23571929",
    token: ADDRESSES.starknet.STRK, // Fusion STRK
  }, {
    address: "0x5eaf5ee75231cecf79921ff8ded4b5ffe96be718bcb3daf206690ad1a9ad0ca",
    token: ADDRESSES.starknet.ETH, // Fusion ETH
  }, {
    address: "0x00a858c97e9454f407d1bd7c57472fc8d8d8449a777c822b41d18e387816f29c",
    token: ADDRESSES.starknet.USDC, // Fusion USDC
  }, {
    address: "0x0115e94e722cfc4c77a2f15c4aefb0928c1c0029e5a57570df24c650cb7cec2c",
    token: ADDRESSES.starknet.USDT, // Fusion USDT
  }], 
  "EkuboVaults": [{
    address: "0x01f083b98674bc21effee29ef443a00c7b9a500fd92cf30341a3da12c73f2324",
    token1: ADDRESSES.starknet.STRK,
    token2: ADDRESSES.starknet.XSTRK
  }, {
    address: "0x3a4f8debaf12af97bb911099bc011d63d6c208d4c5ba8e15d7f437785b0aaa2",
    token1: ADDRESSES.starknet.USDT,
    token2: ADDRESSES.starknet.USDC,
  }, {
    address: "0x160d8fa4569ef6a12e6bf47cb943d7b5ebba8a41a69a14c1d943050ba5ff947",
    token1: ADDRESSES.starknet.USDC,
    token2: ADDRESSES.starknet.ETH
  }, {
    address: "0x351b36d0d9d8b40010658825adeeddb1397436cd41acd0ff6c6e23aaa8b5b30",
    token1: ADDRESSES.starknet.USDC,
    token2: ADDRESSES.starknet.STRK,
  }, {
    address: "0x4ce3024b0ee879009112d7b0e073f8a87153dd35b029347d4247ffe48d28f51",
    token1: ADDRESSES.starknet.ETH,
    token2: ADDRESSES.starknet.STRK,
  }, {
    address: "0x2bcaef2eb7706875a5fdc6853dd961a0590f850bc3a031c59887189b5e84ba1",
    token1: ADDRESSES.starknet.USDC,
    token2: ADDRESSES.starknet.WBTC
  }, {
    address: "0x1c9232b8186d9317652f05055615f18a120c2ad9e5ee96c39e031c257fb945b",
    token1: ADDRESSES.starknet.ETH,
    token2: ADDRESSES.starknet.WBTC
  }, {
    address: "0x1248e385c23a929a015ec298a26560fa7745bbd6e41a886550e337b02714b1b",
    token1: ADDRESSES.starknet.STRK,
    token2: ADDRESSES.starknet.WBTC,
  }],
  "EvergreenVaults": [{
    address: "0x7e6498cf6a1bfc7e6fc89f1831865e2dacb9756def4ec4b031a9138788a3b5e",
    token: ADDRESSES.starknet.USDC
  }, {
    address: "0x446c22d4d3f5cb52b4950ba832ba1df99464c6673a37c092b1d9622650dbd8",
    token: ADDRESSES.starknet.ETH
  }, {
    address: "0x5a4c1651b913aa2ea7afd9024911603152a19058624c3e425405370d62bf80c",
    token: ADDRESSES.starknet.WBTC
  }, {
    address: "0x1c4933d1880c6778585e597154eaca7b428579d72f3aae425ad2e4d26c6bb3",
    token: ADDRESSES.starknet.USDT
  }, {
    address: "0x55d012f57e58c96e0a5c7ebbe55853989d01e6538b15a95e7178aca4af05c21",
    token: ADDRESSES.starknet.STRK
  }]
}

module.exports = {
    STRATEGIES
}