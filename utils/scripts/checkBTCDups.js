const fs = require('fs');
const path = require('path');

// Regular expression to match Bitcoin addresses
// const btcAddressRegex = /\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\b/g;


// Regular expression to match alphanumeric strings between single or double quotes
const addressRegex = /['"]([a-zA-Z0-9]{25,99})['"]/g;

// Function to read all files in a directory recursively
const readFilesInDirectory = (dir) => {
  let files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(readFilesInDirectory(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
};

// Function to extract Bitcoin addresses from a file
const extractBtcAddresses = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.match(addressRegex) || [];
};

// Function to find duplicates between files
const findDuplicates = (folderPath) => {
  const files = readFilesInDirectory(folderPath);
  const addressMap = new Map();

  for (const file of files) {
    const addresses = extractBtcAddresses(file);
    for (let address of addresses) {
      address = address.replace(/'/g, '').replace(/"/g, '')
      if (address.startsWith('0x') || !/\d/.test(address)) continue;
      if (addressMap.has(address)) {
        addressMap.get(address).push(file);
      } else {
        addressMap.set(address, [file]);
      }
    }
  }

  console.log(addressMap)

  // Find duplicates
  const duplicates = [];
  for (const [address, fileList] of addressMap.entries()) {
    if (fileList.length > 1) {
      duplicates.push({ address, files: fileList });
    }
  }

  return duplicates;
};

// Main function
const main = (folderPath) => {
  const duplicates = findDuplicates(folderPath);
  if (duplicates.length > 0) {
    console.log('Duplicate Bitcoin addresses found:');
    for (const { address, files } of duplicates) {
      console.log(`Address: ${address}`);
      console.log(`Files: ${files.join(', ')}`);
      console.log('---');
    }
  } else {
    console.log('No duplicate Bitcoin addresses found.');
  }
};

main(__dirname+'/../../projects');