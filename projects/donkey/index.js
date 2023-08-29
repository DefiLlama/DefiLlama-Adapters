const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getChainTransform } = require('../helper/portedTokens')
const abi = require('./abi.json')

const controllerAddress = {
  ethereum: '0x55e41bc3a99aa24E194D507517b1e8b65eFdAa9e',
  klaytn: '0x35dc04eE1D6E600C0d13B21FdfB5C83D022CEF25'
}

const mainDTokenAddress = {
  ethereum: '0xEc0D3f28D37a3393cf09ee3aD446c485b6afDaA3',
  klaytn: '0xACC72a0cA4E85f79876eD4C5E6Ea29BE1cD26c2e'
}

const stakings = [
  '0x4f2ED52bC4CbdE54e2b3547D3758474A21598D7c',
  '0x024510151204DeC56Cc4D54ed064f62efAC264d5',
  '0x2EacD2D7cF5Cba9dA031C0a9C5d7FDeDc056216C',
  '0x8c9886Aca8B6984c10F988078C5e1D91976dFD16',
  '0x63D21dBD5A30940C605d77882D065736e8fffC94',
]

const DONKEY_TOKEN = '0x4576E6825B462b6916D2a41E187626E9090A92c6'
const ETH = ADDRESSES.null;

async function staking(timestamp, block) {
  const balances = {}
  const donkeyTokens = await sdk.api.abi.multiCall({
    block,
    calls: stakings.map(address => ({ target: DONKEY_TOKEN, params: address })),
    abi: 'erc20:balanceOf',
  })
  sdk.util.sumMultiBalanceOf(balances, donkeyTokens)
  return balances;
}


function getChainTVL(chain) {
  return async function (timestamp, ethBlock, chainBlocks) {
    const block = chainBlocks[chain]
    const transform = await getChainTransform(chain)
    const balances = {}
    const ethMarkets = (await sdk.api.abi.call({ chain, block, target: controllerAddress[chain], abi: abi.getAllMarkets, })).output
    const promises = []

    for (let i = 0; i < ethMarkets.length; i++) {
      promises.push((async () => {
        const marketAddress = ethMarkets[i];
        if (marketAddress === mainDTokenAddress[chain]) {

          let ethBal = await sdk.api.eth.getBalance({ chain, target: marketAddress, block, });
          let balance, token
          if (chain === 'ethereum') {
            token = ETH
            balance = ethBal.output
          } else {
            token = 'klay-token'
            balance = ethBal.output / 1e18
          }
          sdk.util.sumSingleBalance(balances, token, balance)
          return;
        }

        const underlyingAddress = (await sdk.api.abi.call({ chain, block, target: marketAddress, abi: abi.underlying, })).output;
        let cash = (await sdk.api.abi.call({ chain, block, target: underlyingAddress, params: marketAddress, abi: 'erc20:balanceOf', })).output;
        const token = transform(underlyingAddress)
        if (token === 'ripple')
          cash = +cash / 1e6
        sdk.util.sumSingleBalance(balances, token, cash)
      })())
    }
    await Promise.all(promises)
    return balances
  }
}

module.exports = {
  ethereum: {
    staking,
    tvl: getChainTVL('ethereum'),
  },
  klaytn: {
    tvl: getChainTVL('klaytn')
  },
}
