const spawn = require('child_process').spawn;
const util = require('util');
const path = require('path');
const fs = require('fs');

/**
 * Optimizer Base Constructor
 *
 * @constructor
 */
function Optimizer() {
}

/**
 * Create spawn process
 *
 * @public
 * @return ChildProcess
 */
Optimizer.prototype.spawnProcess = function Optimizer_spawnProcess() {
  return spawn(this.command, this.args);
};

/**
 * Find executable binary path
 *
 * @protected
 * @param String binName
 * @return String
 * @throws Error
 */
Optimizer.prototype.findBin = function Optimizer_findBin(binName) {
  const binPath = path.resolve(__dirname, '../../bin/', process.platform, binName);

  if (!fs.existsSync(binPath)) {
    throw new Error(`Undefined binary: ${binPath}`);
  }
  return binPath;
};

/**
 * Extend Optimizer Constructor
 *
 * @static
 * @param Function subConstructor
 * @return Function
 */
Optimizer.extend = function (subConstructor) {
  util.inherits(subConstructor, Optimizer);
  return subConstructor;
};

module.exports = Optimizer;
