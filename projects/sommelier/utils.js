// Flattens a nested array with a depth of 1
function flattenOnce(array) {
  return array.reduce((memo, el) => {
    return [...memo, ...el];
  }, []);
}

module.exports = {
  flattenOnce,
};
