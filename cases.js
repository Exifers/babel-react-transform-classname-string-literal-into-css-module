
// Convert CSS classname into CSS module classname
// This basically converts into camel case but keeping the original case
// of the first letter
function toCamelCaseSoft(input) {
  return input
    .split(/[\-.]+/)
    .filter(s => s.length)
    .reduce(
      (a, c, i) =>
        i === 0
          ? a + c
          : !!a.match(/[a-zA-Z0-9]$/)
          ? a + c[0].toUpperCase() + c.substring(1)
          : a + c,
      ''
    );
}

module.exports = {
  toCamelCaseSoft
};
