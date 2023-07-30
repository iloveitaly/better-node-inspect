#!/usr/bin/env node --expose-internals -r internal/test/binding

process.env.NODE_INSPECT_OPTIONS = '--inspect-resume-on-start=true'

// hijack `require` to load debugger module from this package
const Mod = require('module');
const req = Mod.prototype.require;

Mod.prototype.require = function () {
  if(arguments['0'].startsWith('internal/debugger')) {
    // replace `internal/` and load locally from this package
    return req.apply(this, [__dirname + '/../' + arguments['0'].replace('internal/', '') + ".js"]);
  }

  return req.apply(this, arguments);
};

require('../main/inspect.js')