const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getEnv } = require('../../projects/helper/env');

// Regular expressions
const bitcoinAddressRegex = /\b(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[ac-hj-np-z02-9]{39,59})\b/g;
const bitcoinKeyRegex = /module\.exports\s*=\s*{[^}]*\bbitcoin\b\s*:/s;
const apiUrlRegex = /['"]https?:\/\/[^\s'"]+['"]/g;

// Function to read files in a directory recursively, ignoring node_modules
const readFilesInDirectory = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fullPath.includes('node_modules')) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...readFilesInDirectory(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
};

const extractAllBitcoinAddresses = (files, addressMap, folderPath) => {
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Skip files that likely contain only non-Bitcoin chains
    if (['solana', 'tezos'].some(chain => content.includes(chain)) && !content.includes('bitcoin')) return;

    // Match Bitcoin-specific addresses
    const bitcoinAddresses = content.match(bitcoinAddressRegex) || [];
    const baseFile = file.replace(folderPath, '');
    
    bitcoinAddresses.forEach(address => {
      if (addressMap.has(address)) {
        addressMap.get(address).add(`File:${baseFile}`);
      } else {
        addressMap.set(address, new Set([`File:${baseFile}`]));
      }
    });
  });
};

// Function to identify Bitcoin adapters with "bitcoin" as a key in module.exports
const findBitcoinAdapters = (files, folderPath) => {
  return files
    .filter(file => bitcoinKeyRegex.test(fs.readFileSync(file, 'utf8')))
    .map(file => ({ path: file.replace(folderPath, ''), content: fs.readFileSync(file, 'utf8') }));
};

// Function to extract API URLs from adapter content
const extractApiUrlsForAdapters = (adapters) => {
  return adapters.reduce((map, adapter) => {
    const apiUrls = adapter.content.match(apiUrlRegex) || [];
    map.set(adapter.path, apiUrls.map(url => url.replace(/['"]/g, '')));
    return map;
  }, new Map());
};

// Function to fetch Bitcoin addresses from API URLs
const fetchBitcoinAddressesFromApis = async (apiUrlsMap, addressMap) => {
  const addressesFromApis = new Map();

  for (const [adapter, urls] of apiUrlsMap.entries()) {
    if (urls.length === 0) {
      addressesFromApis.set(adapter, [{ apiUrl: "No API", address: "No data extracted from API" }]);
      continue;
    }

    for (const url of urls) {
      const addresses = await fetchAddressesFromApi(adapter, url, addressMap);
      addressesFromApis.set(adapter, (addressesFromApis.get(adapter) || []).concat(addresses));
    }
  }
  
  return addressesFromApis;
};

// Helper function to fetch addresses from a single API URL
const fetchAddressesFromApi = async (adapter, url, addressMap) => {
  try {
    const response = await axios.get(url, {
      headers: adapter === "\\fbtc\\index.js" && url.includes("fbtc-reserved-addr")
        ? { 'access-token': getEnv('FBTC_ACCESS_TOKEN') }
        : {}
    });

    const bitcoinAddresses = (JSON.stringify(response.data).match(bitcoinAddressRegex) || [])
      .map(addr => addr.replace(/['"]/g, ''));

    if (bitcoinAddresses.length === 0) {
      return [{ apiUrl: url, address: "No data extracted from API" }];
    }

    bitcoinAddresses.forEach(address => {
      if (addressMap.has(address)) {
        addressMap.get(address).add(`API:${adapter}`);
      } else {
        addressMap.set(address, new Set([`API:${adapter}`]));
      }
    });

    return bitcoinAddresses.map(addr => ({ address: addr, apiUrl: url }));

  } catch (error) {
    console.error(`Error fetching data from ${url}: ${error.message}`);
    return [{ apiUrl: url, address: "No data extracted from API" }];
  }
};

const createCombinedCsvFile = async (folderPath) => {
  const files = readFilesInDirectory(folderPath);
  const addressMap = new Map();

  // Extract Bitcoin addresses from all files in the codebase
  extractAllBitcoinAddresses(files, addressMap, folderPath);

  // Identify Bitcoin adapters and extract API URLs
  const bitcoinAdapters = findBitcoinAdapters(files, folderPath);
  const apiUrlsMap = extractApiUrlsForAdapters(bitcoinAdapters);

  const apiAddresses = await fetchBitcoinAddressesFromApis(apiUrlsMap, addressMap);

  let combinedCsvContent = 'Adapter,API_URL,Address\n';
  bitcoinAdapters.forEach(adapter => {
    const adapterPath = adapter.path;
    const adapterApiData = apiAddresses.get(adapterPath) || [{ apiUrl: "No API", address: "No data extracted from API" }];
    adapterApiData.forEach(({ apiUrl, address }) => {
      combinedCsvContent += `"${adapterPath}","${apiUrl}","${address}"\n`;
    });
  });

  const combinedCsvPath = path.join(__dirname, 'bitcoin_apiCrawler.csv');
  fs.writeFileSync(combinedCsvPath, combinedCsvContent, 'utf8');
  console.log(`Combined Bitcoin adapters CSV file created: ${combinedCsvPath}`);

  let duplicateCsvContent = 'Address,Source1,Source2,Source3,Source4,Source5,Source6\n';
  addressMap.forEach((sources, address) => {
    if (sources.size > 1) {
      const sourceArray = Array.from(sources);
      duplicateCsvContent += `"${address}"`;
      for (let i = 0; i < 6; i++) {
        duplicateCsvContent += i < sourceArray.length ? `,"${sourceArray[i]}"` : ',';
      }
      duplicateCsvContent += '\n';
    }
  });

  const duplicateCsvPath = path.join(__dirname, 'duplicate_addresses.csv');
  fs.writeFileSync(duplicateCsvPath, duplicateCsvContent, 'utf8');
  console.log(`Duplicate addresses CSV file created: ${duplicateCsvPath}`);
};

const main = async (folderPath) => {
  await createCombinedCsvFile(folderPath);
};

main(path.join(__dirname, '../../projects'));
