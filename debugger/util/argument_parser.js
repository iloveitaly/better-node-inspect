const {
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypeIncludes,
  StringPrototypeSplit,
  RegExpPrototypeExec,
  RegExpPrototypeTest,
  StringPrototypeIndexOf,
  StringPrototypeSlice,
  ArrayPrototypeJoin,
} = primordials;

function parseBoolean(value) {
  return value === 'true' || value === '1' || value === 'yes';
}

function validatePauseOnExceptionState(value) {
  const validStates = ['uncaught', 'none', 'all'];
  if (!ArrayPrototypeIncludes(validStates, value)) {
    throw new Error(`Invalid state passed for pauseOnExceptionState: ${value}. Must be one of 'uncaught', 'none', or 'all'.`);
  }
  return value;
}

function splitOption(option) {
  const index = StringPrototypeIndexOf(option, '=');
  return [StringPrototypeSlice(option, 0, index), StringPrototypeSlice(option, index + 1)];
}

function handleArg(options, arg, nextArg) {
  let key, value;
  if (RegExpPrototypeTest(/=.+/, arg)) {
    [key, value] = splitOption(arg);
  } else {
    key = arg;
    value = nextArg;
  }

  switch (key) {
    case '--pause-on-exception-state':
      options.pauseOnExceptionState = validatePauseOnExceptionState(value);
      break;
    case '--inspect-resume-on-start':
      options.inspectResumeOnStart = parseBoolean(value);
      break;
  }
  return options;
}

function parseOptions(source, options) {
  if (source) {
    const optionsArr = StringPrototypeSplit(source, ' ');
    for (let i = 0; i < optionsArr.length; i++) {
      options = handleArg(options, optionsArr[i], optionsArr[i+1]);
    }
  }
  return options;
}

// the legacy `node inspect` options assumed the first argument was the target
// to avoid breaking existing scripts, we maintain this behavior

function parseArguments(argv) {
  const legacyArguments = processLegacyArgs(argv)

  let options = {
    pauseOnExceptionState: undefined,
    inspectResumeOnStart: undefined
  }

  // arguments passed over the CLI take precedence over environment variables
  options = parseOptions(process.env.NODE_INSPECT_OPTIONS, options);
  options = parseOptions(ArrayPrototypeJoin(argv, ' '), options);

  return {...options, ...legacyArguments};
}

function processLegacyArgs(args) {
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

module.exports = parseArguments;
