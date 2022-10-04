/**
 * @notice Converts web3 tuple into javascript object recursively
 * @author 0xDAO
 */ 
const sanitize = (data) => {
    let dataKeys = {};
    let object = {};
    let array = [];
  
    // Find all keys (Object.keys will not work here, first we must iterate)
    Object.entries(data).forEach(([key]) => {
      dataKeys[key] = true;
    });
    dataKeys = Object.keys(dataKeys);
    const keysLength = dataKeys.length;
  
    // Detect whether the item is an object or an array
    const isObject = keysLength > data.length;
    if (isObject) {
      dataKeys = dataKeys.slice(dataKeys.length / 2, dataKeys.length);
      dataKeys.forEach((key) => {
        let dataValue = data[key];
        if (Array.isArray(dataValue)) {
          // Recursively sanitize
          dataValue = sanitize(dataValue);
        }
        object[key] = dataValue;
      });
      return object;
    } else {
      // Detect whether the item is an array of objects or an array of values
      if (Array.isArray(data)) {
        dataKeys.forEach((key) => {
          // Recursively sanitize
          array.push(sanitize(data[key]));
        });
      } else {
        return data;
      }
      return array;
    }
  };
  
  module.exports = sanitize;
  