'use strict';

const RECOGNIZED_MODES = ['development', 'production', 'preview'];

function getMode() {
  const flag = process.argv.find((arg) => arg.startsWith('--mode='));
  const mode = flag ? flag.split('=')[1] : process.env.BUILD_MODE || 'development';

  if (!RECOGNIZED_MODES.includes(mode)) {
    throw new Error(`Unknown build mode "${mode}". Expected one of: ${RECOGNIZED_MODES.join(', ')}.`);
  }

  return mode;
}

module.exports = { getMode, RECOGNIZED_MODES };
