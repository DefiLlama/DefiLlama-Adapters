const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const https = require('node:https')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const axios = require('axios')

// Run separately: this suite temporarily changes Axios defaults, not its adapter.
// The loopback HTTPS proxy never forwards requests or resolves RPC destinations.
test('NEO staking uses authenticated HTTPS without downgrade redirects', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'neo-rpc-tls-'))
  const saved = { proxy: axios.defaults.proxy, httpsAgent: axios.defaults.httpsAgent }
  let server
  let agent
  try {
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes',
      '-keyout', path.join(dir, 'key.pem'), '-out', path.join(dir, 'cert.pem'),
      '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost'],
    { stdio: 'ignore' })
    const cert = fs.readFileSync(path.join(dir, 'cert.pem'))
    const requests = []
    let redirect = false
    let value = '11111100000000'
    server = https.createServer({ key: fs.readFileSync(path.join(dir, 'key.pem')), cert }, async (req, res) => {
      let body = ''
      for await (const chunk of req) body += chunk
      requests.push({ url: req.url, method: req.method, body: JSON.parse(body) })
      if (redirect && !req.url.startsWith('http:')) {
        res.writeHead(307, { location: 'http://downgrade.invalid/' })
        res.end()
      } else {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ jsonrpc: '2.0', id: 1,
          result: { state: 'HALT', stack: [{ type: 'Integer', value }] } }))
      }
    })
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })
    const proxy = { protocol: 'https:', host: 'localhost', port: server.address().port }
    // Route localhost deterministically. Positive-case agents explicitly use
    // localhost SNI because Axios otherwise derives SNI from the RPC Host header.
    // This changes only fixture routing/identity, never certificate verification.
    const lookup = (_host, options, cb) => options.all
      ? cb(null, [{ address: '127.0.0.1', family: 4 }])
      : cb(null, '127.0.0.1', 4)
    const cases = [
      ['ghostmarket', '0x9b049f1283515eef1d3f6ac610e1595ed25ca3e9', 'b91888ba149f267ad91817822bf2adaa0e3aa697'],
      ['nudes', '0x340720c7107ef5721e44ed2ea8e314cce5c130fa', 'afdd6abedf066ff8c5fbc868cc89f80eac467142'],
    ]
    for (const [name, contract, account] of cases) {
      const staking = require(`../projects/${name}`).neo.staking
      await t.test(`${name}: trusted TLS preserves request and balance units`, async () => {
        agent = new https.Agent({ ca: cert, lookup, servername: 'localhost' })
        axios.defaults.httpsAgent = agent
        axios.defaults.proxy = proxy
        try {
          for (const [stackValue, balance] of [['11111100000000', 111111], ['22222200000000', 222222]]) {
            value = stackValue
            requests.length = 0
            assert.deepEqual(await staking(), { [name]: balance })
            assert.equal(requests.length, 1)
            assert.equal(requests[0].url.replace(/\/$/, ''), 'https://n3seed1.ngd.network:10332')
            assert.equal(requests[0].method, 'POST')
            assert.deepEqual(requests[0].body, { id: 1, jsonrpc: '2.0', method: 'invokefunction',
              params: [contract, 'balanceOf', [{ type: 'Hash160', value: account }]] })
          }
        } finally { agent.destroy() }
      })
      await t.test(`${name}: rejects untrusted certificates`, async () => {
        agent = new https.Agent({ lookup })
        axios.defaults.httpsAgent = agent
        axios.defaults.proxy = proxy
        requests.length = 0
        try {
          await assert.rejects(staking(), { code: 'DEPTH_ZERO_SELF_SIGNED_CERT' })
          assert.equal(requests.length, 0)
        } finally { agent.destroy() }
      })
      await t.test(`${name}: rejects hostname mismatch even with trusted certificate`, async () => {
        agent = new https.Agent({ ca: cert })
        axios.defaults.httpsAgent = agent
        axios.defaults.proxy = { ...proxy, host: '127.0.0.1' }
        requests.length = 0
        try {
          await assert.rejects(staking(), { code: 'ERR_TLS_CERT_ALTNAME_INVALID' })
          assert.equal(requests.length, 0)
        } finally { agent.destroy() }
      })
      await t.test(`${name}: rejects HTTPS to HTTP redirects`, async () => {
        agent = new https.Agent({ ca: cert, lookup, servername: 'localhost' })
        axios.defaults.httpsAgent = agent
        axios.defaults.proxy = proxy
        requests.length = 0
        redirect = true
        try {
          await assert.rejects(staking(), error => error.response?.status === 307)
          assert.equal(requests.length, 1, 'must not request the plaintext redirect destination')
        } finally { redirect = false; agent.destroy() }
      })
    }
  } finally {
    axios.defaults.proxy = saved.proxy
    axios.defaults.httpsAgent = saved.httpsAgent
    agent?.destroy()
    if (server) await new Promise(resolve => server.close(resolve))
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
