const {
  ArrayPrototypeSplice,
  StringPrototypeSplit
} = primordials;

// Helper function to parse a boolean
function parseBoolean(value) {
  return value === 'true' || value === '1' || value === 'yes';
}

function parseArguments(argv) {
  // Default options
  let options = {
    port: undefined,
    pauseOnExceptionState: undefined,
    inspectResumeOnStart: undefined
  }

  // Parsing process.env.NODE_INSPECT_OPTIONS
  if (process.env.NODE_INSPECT_OPTIONS) {
    const envOptions = StringPrototypeSplit(process.env.NODE_INSPECT_OPTIONS, ' ');
    for (let i = 0; i < envOptions.length; i++) {
      switch (envOptions[i]) {
        case '--port':
          options.port = envOptions[++i];
          break;
        case '--pause-on-exception-state':
          options.pauseOnExceptionState = envOptions[++i];
          break;
        case '--inspect-resume-on-start':
          options.inspectResumeOnStart = parseBoolean(envOptions[++i]);
          break;
      }
    }
  }

  // Parsing argv
  for (let i = 0; i < argv.length;) {
    switch (argv[i]) {
      case '--port':
        options.port = argv[i+1];
        ArrayPrototypeSplice(argv, i, 2);
        break;
      case '--pause-on-exception-state':
        options.pauseOnExceptionState = argv[i+1];
        ArrayPrototypeSplice(argv, i, 2);
        break;
      case '--inspect-resume-on-start':
        options.inspectResumeOnStart = parseBoolean(argv[i+1]);
        ArrayPrototypeSplice(argv, i, 2);
        break;
      default:
        i++;
        break;
    }
  }

  return options;
}

function parseArgv(args) {
  const target = ArrayPrototypeShift(args);
  let host = '127.0.0.1';
  let port = 9229;
  let isRemote = false;
  let script = target;
  let scriptArgs = args;

  const hostMatch = RegExpPrototypeExec(/^([^:]+):(\d+)$/, target);
  const portMatch = RegExpPrototypeExec(/^--port=(\d+)$/, target);

  if (hostMatch) {
    // Connecting to remote debugger
    host = hostMatch[1];
    port = Number(hostMatch[2]);
    isRemote = true;
    script = null;
  } else if (portMatch) {
    // Start on custom port
    port = Number(portMatch[1]);
    script = args[0];
    scriptArgs = ArrayPrototypeSlice(args, 1);
  } else if (args.length === 1 && RegExpPrototypeExec(/^\d+$/, args[0]) !== null &&
             target === '-p') {
    // Start debugger against a given pid
    const pid = Number(args[0]);
    try {
      process._debugProcess(pid);
    } catch (e) {
      if (e.code === 'ESRCH') {
        process.stderr.write(`Target process: ${pid} doesn't exist.\n`);
        process.exit(kGenericUserError);
      }
      throw e;
    }
    script = null;
    isRemote = true;
  }

  return {
    host, port, isRemote, script, scriptArgs,
  };
}

module.exports = { parseArguments };
