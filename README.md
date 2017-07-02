# fundle

## Quick Start:

```
npm install -g truffle
npm install -g solium 
npm install -g testrpc

# in fundle directory
solium --init

# Start the test chain (needed for running tests)
testrpc
```

## Useful bash commands:

```
source scripts
```

Will make available the following:

```
  fnd compile  - Compile (with linting)
  fnd test     - Run tests (with linting)
  fnd lint     - Run the Solium linter on its own
  fnd migrate  - Run migrations
  fnd help     - Show this again
```
