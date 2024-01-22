const { get } = require("../helper/http")
const BKN_TOKEN_CONTRACT = '0x0A638F07ACc6969abF392bB009f216D22aDEa36d';
let _response;

async function getFromEndpoint() {
  if (!_response) _response = get('https://cmc.brickken.com/get?parameter=circulating')
  const response = await _response;
  return response
}

async function tvl(_, _1, _2, {api}) {
  const circulating = await getFromEndpoint();

  api.add(BKN_TOKEN_CONTRACT, circulating)
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl,
  },
  methodology: `We get the TVL as the value of the freely circulating number of BKNs, we don't differentiate between chains and we cumulate across all chains.`,
}; 