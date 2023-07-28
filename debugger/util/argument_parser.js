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

module.exports = { parseArguments };
