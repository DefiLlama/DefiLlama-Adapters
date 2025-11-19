const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: [
    // https://docs.reservoir.xyz/products/proof-of-reserves
    '0x0c7e4342534e6e8783311dCF17828a2aa0951CC7',
    '0x9BB2c38F57883E5285b7c296c66B9eEA4769eF80',
    '0x99A95a9E38e927486fC878f41Ff8b118Eb632b10',
    '0xE45321525c85fcc418C88E606B96daD8cBcc047f',
    '0x841DB2cA7E8A8C2fb06128e8c58AA162de0CfCbC',
    '0x99E8903bdEFB9e44cd6A24B7f6F97dDd071549bc',
    '0x2Adf038b67a8a29cDA82f0Eceb1fF0dba704b98d',
    '0xb82749F316CB9c06F38587aBecF3EB1bC842CC93'
    // '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61', - exluded RUSD because it is project's own token
  ],
  plasma: [],
  arbitrum: []
}

const assets = {
  sUSDe: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
  'eUSDC-22': '0xe0a80d35bb6618cba260120b279d357978c42bce'
}

Object.keys(config).forEach(chain => {

  if (chain === 'ethereum') {
    const funds = config[chain]
    module.exports[chain] = {
      tvl: async (api) => {
        // count assets on tvl adapters
        const tokens = await api.multiCall({ abi: 'address:underlying', calls: funds })
        const bals = await api.multiCall({ abi: 'uint256:totalValue', calls: funds })
        const decimals = await api.multiCall({ abi: 'uint8:decimals', calls: tokens })
        bals.forEach((v, i) => bals[i] = v * 10 ** (decimals[i] - 18))
        api.add(tokens, bals)

        // count USDC locked in 0x4809010926aec940b550D34a46A52739f996D75D
        api.sumTokens({
          owner: '0x4809010926aec940b550D34a46A52739f996D75D', token: ADDRESSES.ethereum.USDC
        })

        let shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: assets['eUSDC-22'], params: ['0x3063C5907FAa10c01B242181Aa689bEb23D2BD65'] })

        api.add(assets['eUSDC-22'], shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: assets.sUSDe, params: ['0x5563CDA70F7aA8b6C00C52CB3B9f0f45831a22b1'] })

        api.add(assets.sUSDe, shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0x62C6E813b9589C3631Ba0Cdb013acdB8544038B7', params: ['0x8d3A354f187065e0D4cEcE0C3a5886ac4eBc4903'] })

        api.add('0x4c9EDD5852cd905f086C759E8383e09bff1E68B3', shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0xBeEf11eCb698f4B5378685C05A210bdF71093521', params: ['0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61'] })

        api.add('0xBeEf11eCb698f4B5378685C05A210bdF71093521', shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0xBEeFFF209270748ddd194831b3fa287a5386f5bC', params: ['0x841DB2cA7E8A8C2fb06128e8c58AA162de0CfCbC'] })

        api.add('0xBEeFFF209270748ddd194831b3fa287a5386f5bC', shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0xA0804346780b4c2e3bE118ac957D1DB82F9d7484', params: ['0x289C204B35859bFb924B9C0759A4FE80f610671c'] })

        api.add('0xA0804346780b4c2e3bE118ac957D1DB82F9d7484', shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0x777791C4d6DC2CE140D00D2828a7C93503c67777', params: ['0x2adf038b67a8a29cda82f0eceb1ff0dba704b98d'] })

        api.add('0x777791C4d6DC2CE140D00D2828a7C93503c67777', shareBalance)

        return api.getBalances()
      }
    }
  }
  else if (chain === 'plasma') {
    module.exports[chain] = {
      tvl: async (api) => {

        let balance;

        balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0x7519403E12111ff6b710877Fcd821D0c12CAF43A', params: ['0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f'] })

        api.add('0x7519403E12111ff6b710877Fcd821D0c12CAF43A', balance)

        balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0xa9C251F8304b1B3Fc2b9e8fcae78D94Eff82Ac66', params: ['0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f'] })

        api.add('0xa9C251F8304b1B3Fc2b9e8fcae78D94Eff82Ac66', balance)

        balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0x1DD4b13fcAE900C60a350589BE8052959D2Ed27B', params: ['0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f'] })

        api.add('0x1DD4b13fcAE900C60a350589BE8052959D2Ed27B', balance)

        balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0xa9C251F8304b1B3Fc2b9e8fcae78D94Eff82Ac66', params: ['0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f'] })

        api.add('0xa9C251F8304b1B3Fc2b9e8fcae78D94Eff82Ac66', balance)

        balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948', params: ['0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f'] })

        api.add('0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948', balance)

        return api.getBalances()
      }
    }
  }
  else if (chain === 'arbitrum') {
    module.exports[chain] = {
      tvl: async (api) => {

        let balance;

        balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0x5c0C306Aaa9F877de636f4d5822cA9F2E81563BA', params: ['0x289C204B35859bFb924B9C0759A4FE80f610671c'] })

        api.add('0x5c0C306Aaa9F877de636f4d5822cA9F2E81563BA', balance)

        balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0x7e97fa6893871A2751B5fE961978DCCb2c201E65', params: ['0x289C204B35859bFb924B9C0759A4FE80f610671c'] })

        api.add('0x7e97fa6893871A2751B5fE961978DCCb2c201E65', balance)

        balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: '0x1A996cb54bb95462040408C06122D45D6Cdb6096', params: ['0x289C204B35859bFb924B9C0759A4FE80f610671c'] })

        api.add('0x1A996cb54bb95462040408C06122D45D6Cdb6096', balance)

        return api.getBalances()
      }
    }
  }
})
