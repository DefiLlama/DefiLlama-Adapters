const axios = require('axios')
const BigNumber = require('bignumber.js')
const ethers = require('ethers')
const { toHex } = require('tron-format-address')
const axiosObj = axios.create({
  baseURL: 'https://api.trongrid.io/',
  headers: {
    'TRON-PRO-API-KEY': '66410e19-c0f6-449c-aae3-78f2581a1a0b',
    'Content-Type': 'application/json'
  },
  timeout: 300000,
})

const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";

function encodeParams(inputs) {
  let typesValues = inputs
  let parameters = ''

  if (typesValues.length == 0)
    return parameters
  const abiCoder = new AbiCoder();
  let types = [];
  const values = [];

  for (let i = 0; i < typesValues.length; i++) {
    let { type, value } = typesValues[i];
    if (type == 'address')
      value = value.replace(ADDRESS_PREFIX_REGEX, '0x');
    else if (type == 'address[]')
      value = value.map(v => toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x'));
    types.push(type);
    values.push(value);
  }

  return abiCoder.encode(types, values).replace(/^(0x)/, '');
}

function decodeParams(types, output, ignoreMethodHash) {

  if (!output || typeof output === 'boolean') {
      ignoreMethodHash = output;
      output = types;
  }

  if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8)
      output = '0x' + output.replace(/^0x/, '').substring(8);

  const abiCoder = new AbiCoder();

  if (output.replace(/^0x/, '').length % 64)
      throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');
  return abiCoder.decode(types, output).reduce((obj, arg, index) => {
      if (types[index] == 'address')
          arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
      obj.push(arg);
      return obj;
  }, []);
}

// api reference: https://developers.tron.network/reference
const owner_address = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

async function unverifiedCall(contract, functionSelector, parameter) {
  var body = {
    owner_address: owner_address,
    contract_address: contract,
    function_selector: functionSelector,
    parameter: encodeParams(parameter),
    visible: true,
  };
  const axiosResponse = await axiosObj.post('/wallet/triggerconstantcontract', body)
  return BigNumber("0x" + axiosResponse.data['constant_result'][0])
}

function getUnverifiedTokenBalance(token, account) {
  return unverifiedCall(token, 'balanceOf(address)', [
    {
      type: 'address',
      value: toHex(account)
    }
  ])
}

async function getTokenBalance(token, account) {
  const [balance, decimals] = await Promise.all([
    getUnverifiedTokenBalance(token, account),
    unverifiedCall(token, 'decimals()', [])
  ]);
  return Number(balance.toString()) / (10 ** decimals)
}

async function getTrxBalance(account) {
  const axiosResponse = await axiosObj.get('v1/accounts/' + account)
  return axiosResponse.data.data[0].balance
}


module.exports = {
  getTokenBalance,
  getTrxBalance,
  getUnverifiedTokenBalance,
  unverifiedCall
}
