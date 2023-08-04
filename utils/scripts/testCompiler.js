const solc = require('solc');
const fs = require('fs');

const contractName = 'UniV2TVL';
const contractFile = `${contractName}.sol`;
// Solidity contract code
const solidityCode = fs.readFileSync(__dirname+`/../contracts/${contractFile}`, 'utf8');

function compileContract(contractCode) {
  const input = {
    language: 'Solidity',
    sources: {
      [contractFile]: {
        content: contractCode,
      },
    },
    settings: {
      outputSelection: { '*': { '*': ['*'], }, },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const bytecode = output.contracts[contractFile][contractName].evm.bytecode.object;
  fs.writeFileSync(__dirname+`/../artifacts/${contractName}.bytecode`, bytecode)
}

// Compile the contract and get the bytecode
compileContract(solidityCode)