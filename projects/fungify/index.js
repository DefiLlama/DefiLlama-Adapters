const { compoundExports2 } = require('../helper/compound')

const cExports = compoundExports2({ comptroller: '0xf9c70750bF615dE83fE7FF62D30C7faACD8f8Ba0', cether: '0x70C4F75ebaF99e24d775C91867b1a844da6eF6FD', })
module.exports = {
  ethereum: {
    tvl: cExports.tvl,
    borrowed,
  },
};

async function borrowed(...args) {
  const res = await cExports.borrowed(...args)
  const { api } = args[3]
  const ethKeys = Object.keys(res).filter(key => key.startsWith('ethereum:')).map(key => key.replace('ethereum:', ''))
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: ethKeys, permitFailure: true })
  ethKeys.forEach((key, idx) => {
    if (decimals[idx]) return;
    res[`ethereum:${key}`] = res[`ethereum:${key}`] / 1e18
  })
  return res
}