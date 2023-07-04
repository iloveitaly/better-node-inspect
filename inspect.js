#!/usr/bin/env node --expose-internals -r internal/test/binding

const Mod = require('module');

const req = Mod.prototype.require;

const path = require('path');
// const packagePath = path.dirname(require.resolve('better-node-repl'));
console.log(require("module").globalPaths)
console.log(__dirname)
console.log(global.primordials)

Mod.prototype.require = function () {
  if(arguments['0'].startsWith('internal/debugger')) {
    // replace `internal/` and load locally
    // console.log("hijacked!", arguments['0'])
    // get current path to this package
    return req.apply(this, [__dirname + '/' + arguments['0'].replace('internal/', '') + ".js"]);
  }

  // do some side-effect of your own
  // console.log("require", arguments['0'])
  return req.apply(this, arguments);
};

// TODO copied from node.js ---

const {
  prepareMainThreadExecution,
  markBootstrapComplete,
} = require('internal/process/pre_execution');

prepareMainThreadExecution();


markBootstrapComplete();

// Start the debugger agent.
process.nextTick(() => {
  require('internal/debugger/inspect').start();
});
