const PoSPoolProxy1967 = "cfx:type.contract:accpx9uxky39pg1hzav757vdej95w1kbcp13d0hvm7";
const rpc = "https://main.confluxrpc.com";

async function tvl(_, _1, _2, { api }) {
  // this result has to be multiplied by 1000, 
  // as you can stake minimum 1000 tokens
  const poolSummaryResponse = await fetch(rpc, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'cfx_call',
      params: [{
        to: PoSPoolProxy1967,
        data: '0x7571fcf6' // poolSummary() in keccak256
      }, 'latest_state'],
      id: 1
    })
  })
    .then(res => res.json())
    .then(res => res.result)

  // the result returns 3 values, we only need the first one
  // every value is 32 bytes long, so we slice the first 32 bytes ("0x" + 64 characters)
  const cfxTVL = parseInt(poolSummaryResponse.slice(2, 66), 16)

  return {
    'conflux-token': cfxTVL * 1000
  }
}

module.exports = {
  methodology: 'Calls poolSummary() in the proxy contract. The result is multiplied by 1000, as you can stake minimum 1000 CFX.',
  conflux: {
    tvl,
  }
};