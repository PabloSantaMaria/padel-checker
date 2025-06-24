# 🧪 Tests

This folder contains all the test scripts for the Padel Checker system.

## Test Files

### Individual Tests

- **`test-config.js`** - Tests configuration loading and club setup
- **`test-api.js`** - Tests API connectivity and data retrieval from clubs
- **`test-utils.js`** - Tests utility functions (date formatting, slot validation, etc.)
- **`test-storage.js`** - Tests the notification storage system
- **`test-complete-system.js`** - Full system integration test (includes email sending)

### Test Runner

- **`run-all-tests.js`** - Runs all tests in the correct order

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Individual Tests

```bash
npm run test:config    # Configuration test
npm run test:api       # API connectivity test  
npm run test:utils     # Utilities test
npm run test:storage   # Storage system test
npm run test:system    # Complete system test (may send email)
```

### Manual Execution

```bash
# Build first
npm run build

# Then run any test directly
node tests/test-config.js
node tests/test-api.js
# etc.
```

## Test Details

### Configuration Test (`test-config.js`)

- Verifies app-config.json is loaded correctly
- Shows enabled clubs and their settings
- Displays scheduling and availability configuration

### API Test (`test-api.js`)

- Tests connectivity to each configured club's API
- Shows available courts and padel slots
- Verifies sport filtering (only padel courts)
- Updated to use current system configuration structure

### Utils Test (`test-utils.js`)

- Tests date formatting and localization
- Validates slot time checking logic
- Verifies running hours detection
- Tests timezone handling

### Storage Test (`test-storage.js`)

- Tests notification tracking system
- Verifies no duplicate notifications
- Tests TTL (time-to-live) functionality
- Shows storage statistics

### Complete System Test (`test-complete-system.js`)

- **⚠️ This test may send an actual email if configured**
- Tests the entire workflow from API to email
- Generates mock slots and filters them
- Tests message generation and formatting
- Marks test slots as notified
- Uses "[TEST]" prefix in email subject

## Notes

- All tests require the project to be built first (`npm run build`)
- The complete system test may send an email if EMAIL_* environment variables are configured
- Tests use the same configuration as the main application (`app-config.json` and `.env`)
- Storage tests will create/modify `notified-slots.json` for testing purposes

## Updated from Root

These tests replace the old test files that were in the project root:

- ~~`test-api.js`~~ → `tests/test-api.js` (updated)
- ~~`test-clubs.js`~~ → `tests/test-config.js` (enhanced)
- ~~`test-script.js`~~ → `tests/test-complete-system.js` (updated)

The new tests are updated to match the current system structure and include additional testing capabilities.
