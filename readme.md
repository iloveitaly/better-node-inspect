# Better Node Inspect: A Better Node Command Line Debugger

Let's make `node inspect` better on the command line! I'm used to amazing CLI debugging tools like ipython, iex, and pry. I want to bring some of that magic to node.

## Goals

This isn't going to all be possible, but here's my wishlist:

* Returning a object in the REPL prints the whole object, rather than a truncated version of the object with `...`
* Easily copy content (JSON representation of a object, large strings, etc) into the clipboard
* Optionally support printing long output to a pager
* Ability to execute typescript in the repl, ignoring any typing errors (transpilation only)
* Colorized output.
* Ability to use `await` in a debugger session (`SyntaxError: await can not be used when evaluating code while paused in the debugger`)
* Automatically pause on an exception and keep all state
* Ability to reload code, even if it's already been loaded. With ESM and a custom loader (possibly built on top of esbuild's ESM loader), this should be possible.
* Ability to define a function dynamically with `function name() {}`
* Ability to paste in a multiline command
* Tab completion for locally defined variables
* Ability to print without leading `>` in debug mode
* [Show stack trace in debugger](https://github.com/nodejs/help/issues/4039) when it's seems to be doing nothing
* I don't want my imports rewritten from `log` into `loglevel_1`
* Shortcut to open my editor at the `file:line:column`
* Ability to define custom debugger shortcuts (i.e. `c` vs `cont`)
* `_` does not work in a debugger repl, I want to get the last result using that shortcut
* Drop into a repl immediately instead of a `debug>` session, or execute certain types of code within the inner repl automatically.
* Custom backtrace filters using a middleware-like interface
* `_ex_` exception reference when an exception is raised
* `up` and `down` [stacktrace navigation](https://stackoverflow.com/questions/33769082/how-to-move-up-down-stack-frames-using-node-js-built-in-debugger)
* If there's an exception, but the original source is not present, jump to the source in github
* File location follows `next`, `up`, etc. By default, this does not seem to happen.
* Sourcemap-aware file and line locations. If you use `tsx`, or any other transpilation tool, the source and line + column numbers are based on the transpiled code, not the original source.
* Avoid `process.stdout` breaking when certain content is passed to it. When the debugger is active, the event loop is paused, and the `drain` event is not processed causing `process.stdout.write` to stop working entirely.
* Works with test runners like jest and vitest
* Automatically start a debugger session when an exception is thrown in a test

## What's done

- [x] `up` and `down` stacktrace **navigation**
- [x] `frame(n)` to jump to a specific stack frame
- [x] colorized output
- [x] pretty print objects using `pp`
- [x] list local variables with `locals`
- [x] list current file location with context using `ls`
- [x] get current file location using `location`
- [x] set default exception state via `--pause-on-exception-state`
- [x] don't pause at the beginning of execution via `--inspect-resume-on-start`
- [x] set `node inspect` specific CLI arguments using `NODE_INSPECT_OPTIONS` env var (export `NODE_INSPECT_OPTIONS="--inspect-resume-on-start true --pause-on-exception-state uncaught"`)

### Upstream PRs

One of my biggest gripes with the nodejs ecosystem is how fragmented it is. My goal is to get all [of the changes here upstreamed](https://github.com/nodejs/node/pulls?q=is%3Apr+author%3Ailoveitaly):

- [ ] https://github.com/nodejs/node/pull/48425
- [ ] https://github.com/nodejs/node/pull/48785

## Usage

In order to use the improved inspector:

```bash
better-node-repl the-file.js
```

To use the repl utilities make sure you import the module:

```javascript
import "better-node-inspect"
```

## Developing on `node inspect`

### Where Things Are

It's always helpful to understand how things are wired together when you are hacking:

- [`node inspect` entrypoint](https://github.com/iloveitaly/node/blob/6144954c95d96146a3360c93310d9de562721ea0/lib/internal/main/inspect.js#L1)
- [Where `node:` require paths are processed](https://github.com/iloveitaly/node/blob/6144954c95d96146a3360c93310d9de562721ea0/lib/internal/modules/cjs/loader.js#L911)
- [Debugger.on events](https://github.com/iloveitaly/node/blob/6144954c95d96146a3360c93310d9de562721ea0/deps/v8/include/js_protocol-1.3.json#L771)
- [Visual/prettier debugger protocol documentation](https://chromedevtools.github.io/devtools-protocol/1-3/Runtime/)
- [Where `node inspect` is run from](https://github.com/iloveitaly/node/blob/6144954c95d96146a3360c93310d9de562721ea0/lib/internal/main/inspect.js#L17)
- [Where expectation errors are throw in jest](https://github.com/jestjs/jest/blob/0fd5b1c37555f485c56a6ad2d6b010a72204f9f6/packages/expect/src/index.ts#L335-L339). If you jump two frames up from here, you'll end up in your test code.

## Inspiration

There's been a lot of attempts to improve the node REPL over the years:

* [nbd](https://github.com/GoogleChromeLabs/ndb) is dead and hasn't been updated in years
* [node-help](https://github.com/foundling/node-help) is dead as well and just made it slightly easier to view documentation.
* [node-inspector](https://github.com/node-inspector/node-inspector) is now included in node and basically enables you to use Chrome devtools
* [local-repl](https://github.com/sloria/local-repl) some great concepts around importing aspects of your project right into the repl. Hasn't been updated in years.
* The updated [repl](https://github.com/nodejs/repl) project wouldn't load for me on v16.
* https://github.com/NicolasPetton/Indium
* https://github.com/danielgtaylor/nesh
* https://github.com/wesgarland/niim lots of good ideas here, but was abandoned years ago.
* https://github.com/11ways/janeway still actively developed, great object inspection