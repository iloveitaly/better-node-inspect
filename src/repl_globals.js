// TODO wrap this up into a nice little config function
// TODO replace console.dir with custom method with better formatting
const util = require("util")
// util.inspect.defaultOptions.maxArrayLength = null
// util.inspect.defaultOptions.colors = true

// declare global {
//   var dir: InstanceType<typeof Function>
//   var toJson: InstanceType<typeof Function>
//   var copyToClipboard: InstanceType<typeof Function>
//   var getClassName: InstanceType<typeof Function>
// }

// https://nodejs.org/api/util.html

// TODO check if globals are accessible in a repl

// TODO https://stackoverflow.com/questions/60558170/how-to-auto-reload-files-in-node-js-while-using-esm
// global.awaitReload

// https://stackoverflow.com/questions/5670752/how-can-i-pretty-print-json-using-node-js
global.dir = (ob) => process.stdout.write(require("util").inspect(ob, {depth: null, colors: true}))

function toJson(obj) {
  const jsonStr = JSON.stringify(obj, undefined, 2)
  copyToClipboard(jsonStr)
  return jsonStr
}
global.toJson = toJson

// TODO detect if object or string
// https://stackoverflow.com/questions/5670752/how-can-i-pretty-print-json-using-node-js
function toFile(obj, path) {
  var fs = require('fs');

  var outputFilename = '/tmp/my.json';

  fs.writeFile(outputFilename, JSON.stringify(obj, null, 4), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + outputFilename);
      }
  });
}

function writeStdout(str) {
  require("fs").writeSync(1, str);
  return void 0;
}
global.writeStdout = writeStdout

function inspectObject(obj) {
  const util = require("node:util")
  const inspectOutput = util.inspect(obj, {depth: null, colors: true, maxArrayLength: null, maxStringLength: null})
  return inspectOutput
}
global.inspectObject = inspectObject

// copyToClipboard = (text) => {
function copyToClipboard(text) {
  require("child_process").spawnSync("/usr/bin/pbcopy", [], {
    env: {
      LC_CTYPE: "UTF-8",
    },
    input: text,
  })
}
global.copyToClipboard = copyToClipboard

function stringFromClipboard() {
  const result = require("child_process").spawnSync("/usr/bin/pbpaste", [], {
    env: {
      LC_CTYPE: "UTF-8",
    },
  });

  if (result.error) {
    console.error('Error:', result.error);
    return null;
  }

  return result.stdout.toString();
}
global.stringFromClipboard = stringFromClipboard

// https://stackoverflow.com/questions/332422/get-the-name-of-an-objects-type
function getClassName(target) {
  const funcNameRegex = /function (.{1,})\(/
  const results = funcNameRegex.exec(getClassName.constructor.toString())
  return results && results.length > 1 ? results[1] : ""
}
global.getClassName = getClassName

// https://github.com/nodejs/node/issues/9617
function isDebugEnabled() {
  // even when using `node inspect` internally it gets transformed into --inspect-brk, which is why we check for this
  const inspectPassedOverCLI =
    process.execArgv.filter(
      (a) => a.includes("--inspect-brk") || a == "inspect"
    ).length > 0
  return require("inspector").url() !== undefined || inspectPassedOverCLI
}

// TODO doesn't seem to work in async context... how can we detect this?
async function repl(context = {}) {
  if (isDebugEnabled()) {
    // TODO `error` does not display any colored text... really?
    console.error("ERROR: Debug mode enabled, do not use repl!")
    return
  }

  console.log("Starting REPL...")


  const repl = require("repl")
  const replServer = repl.start({
    prompt: "❯ ",
    input: process.stdin,
    output: process.stdout,
    useGlobal: true,
    preview: false,
  })

  // transform import statements into `await import` statements
  const _eval = replServer.eval
  async function inlineImports(cmd, context, filename, callback) {
    if (cmd.startsWith("import")) {
      cmd = cmd.replace(/import (.+) from (.+)/, "let $1 = await import($2);")
    }

    _eval(cmd, context, filename, callback)
  }
  replServer.eval = inlineImports

  replServer.setupHistory(
    '.node_repl_history',
    (error, replServer) => {
      if (error) throw error
    }
  )

  // TODO tie into the ts-node repl
  // TODO remove all 'const ' from the input to avoid redeclaring variables error

  // list out all local variables
  replServer.defineCommand("locals", {
    help: "List all local variables",
    action: function () {
      this.displayPrompt()
      console.log(Object.keys(this.context))
    },
  })

  for (const key in context) {
    replServer.context[key] = context[key]
  }
}
global.repl = repl