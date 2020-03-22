const LoggerFactory = require('labelled-logger');
const colors = require('labelled-logger').colors;
const k = require("./keys");

const labelsData = [
  {
    label: k.prepare,
    color: colors.GREEN
  },
  {
    label: k.parse,
    color: colors.PURPLE
  },
  {
    label: k.extract,
    color: colors.BLUE
  },
  {
    label: k.compute,
    color: colors.RED
  },
  {
    label: k.create,
    color: colors.YELLOW
  }
];

const levelsData = [
  {value: 0}, {value:1}, {value:2}, {value:3}, {value:4}
];

const logger = LoggerFactory.createLogger(labelsData, levelsData);
logger.setLevel(1);
logger.disable();


module.exports = logger;
