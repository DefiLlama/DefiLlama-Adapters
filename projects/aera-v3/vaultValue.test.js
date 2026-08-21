const assert = require('node:assert/strict')
const test = require('node:test')
const { getVaultValue, getVaultValueAbi, versionAbi } = require('./vaultValue')

const vault = '0x0000000000000000000000000000000000000001'
const feeCalculator = '0x0000000000000000000000000000000000000002'

test('uses the legacy calculation only when the V2 selector is unavailable', async () => {
  const calledAbis = []
  const api = {
    call: async ({ abi }) => {
      calledAbis.push(abi)
      if (abi === versionAbi) throw new Error('execution reverted')
      if (abi === 'uint256:totalSupply') return '1000'
      if (abi === 'uint8:decimals') return 2
      if (abi.startsWith('function getVaultState')) return [false, 0, 0, 0, 0, 0, 0, 0, '5', 0, 0]
      throw new Error(`Unexpected ABI: ${abi}`)
    },
  }

  assert.equal(await getVaultValue(api, vault, feeCalculator), '50')
  assert.equal(calledAbis.includes(getVaultValueAbi), false)
})

test('propagates a transient V2 getter failure', async () => {
  const transientError = new Error('temporary RPC failure')
  const api = {
    call: async ({ abi }) => {
      if (abi === versionAbi) return '2.0'
      assert.equal(abi, getVaultValueAbi)
      throw transientError
    },
  }

  await assert.rejects(getVaultValue(api, vault, feeCalculator), error => error === transientError)
})

test('returns the V2 getter value when the selector is available', async () => {
  const api = {
    call: async ({ abi }) => {
      if (abi === versionAbi) return '2.0'
      assert.equal(abi, getVaultValueAbi)
      return '123'
    },
  }

  assert.equal(await getVaultValue(api, vault, feeCalculator), '123')
})

test('propagates a transport failure from the version probe', async () => {
  const transportError = new Error('server response 301 Moved Permanently')
  const api = {
    call: async ({ abi }) => {
      assert.equal(abi, versionAbi)
      throw transportError
    },
  }

  await assert.rejects(getVaultValue(api, vault, feeCalculator), error => error === transportError)
})
