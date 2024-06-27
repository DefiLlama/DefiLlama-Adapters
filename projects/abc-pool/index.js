const PoSPoolProxy1967_core = "cfx:type.contract:accpx9uxky39pg1hzav757vdej95w1kbcp13d0hvm7";
const PoSPoolProxy1967_espace = "0xb6eb7aa86f3886b6edc0fc1c826221b1fb26e437";
const core_rpc = "https://main.confluxrpc.com";
const espace_rpc = "https://evm.confluxrpc.com";

const poolSummaryResponse = (rpc, method, contract, state) => {
  return fetch(rpc, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: [{
        to: contract,
        data: '0x7571fcf6' // poolSummary() in keccak256
      }, state],
      id: 1
    })
  })
    .then(res => res.json())
    .then(res => res.result)
}


async function tvl(api) {
  // this result has to be multiplied by 1000, 
  // as you can stake minimum 1000 tokens
  const core_poolSummaryResponse = await poolSummaryResponse(
    core_rpc,
    'cfx_call',
    PoSPoolProxy1967_core,
    'latest_state'
  )
  const espace_poolSummaryResponse = await poolSummaryResponse(
    espace_rpc,
    'eth_call',
    PoSPoolProxy1967_espace,
    'latest'
  )
  // the result returns 3 values, we only need the first one
  // every value is 32 bytes long, so we slice the first 32 bytes ("0x" + 64 characters)
  const core_cfxTVL = parseInt(core_poolSummaryResponse.slice(2, 66), 16)
  const espace_cfxTVL = parseInt(espace_poolSummaryResponse.slice(2, 66), 16)

  return {
    'conflux-token': (core_cfxTVL + espace_cfxTVL) * 1000
  }
}

module.exports = {
  methodology: 'Calls poolSummary() in the proxy contract. The result is multiplied by 1000, as you can stake minimum 1000 CFX.',
  conflux: {
    tvl
  }
};