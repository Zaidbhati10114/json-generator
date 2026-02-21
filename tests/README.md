# Test Structure

This directory contains organized test files for the JSON Generator project.

## Directory Structure

```
tests/
├── helpers/           # Shared test utilities and configuration
│   ├── config.js      # Test constants and configuration
│   └── test-utils.js  # Common test functions
├── load/              # Load testing files
│   ├── rate-limit-sequential.test.js     # Sequential rate limit tests
│   ├── rate-limit-parallel.test.js       # Parallel rate limit tests
│   └── *-original.test.js                # Original test files (preserved)
└── README.md         # This file
```

## Usage

### Load Testing
```bash
# Run sequential rate limit tests
npm run test:load:sequential

# Run parallel rate limit tests  
npm run test:load:parallel

# Run all load tests
npm run test:load
```

### Test Utilities
The `helpers/` directory provides:
- `config.js` - Centralized test configuration
- `test-utils.js` - Reusable functions for API requests, result processing, and reporting

## Migration Notes
- Original test files have been preserved with `-original` suffix
- New refactored tests use shared utilities to reduce code duplication
- Test scripts are now available via npm commands
