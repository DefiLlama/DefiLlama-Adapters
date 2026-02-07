const { uniV3Export } = require("../helper/uniswapV3");


module.exports = uniV3Export({
  ethereum: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 18044650, },
  optimism: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 115235065, },
  base: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 9672720, permitFailure: true },
  arbitrum: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 173576189, permitFailure: true, },
  fantom: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 73057898, permitFailure: true, },
  sonic: { factory: "0x777fAca731b17E8847eBF175c94DbE9d81A8f630", fromBlock: 514659, permitFailure: true, },
});
module.exports.hallmarks = [
  ['2023-09-03', "Solidly V3 launch"],
]