const { post } = require('./http')
const { prepareExecCmd } = require('./utils/pact')

async function fetchLocal(localCmd, apiHost) {
  if (!apiHost) throw new Error(`Pact.fetch.local(): No apiHost provided`);

  const { pactCode, meta = mkMeta("", "", 0, 0, 0, 0), networkId } = localCmd
  const cmd = prepareExecCmd(pactCode, meta, networkId);
  const res = await post(`${apiHost}/api/v1/local`, cmd)
  return res;
}

function mkMeta(sender, chainId, gasPrice, gasLimit, creationTime, ttl) {
  return {
    creationTime: creationTime,
    ttl: ttl,
    gasLimit: gasLimit,
    chainId: chainId,
    gasPrice: gasPrice,
    sender: sender
  };
}

module.exports = {
  fetchLocal,
  mkMeta,
}