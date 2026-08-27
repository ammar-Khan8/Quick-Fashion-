const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Quick-Fashion Servers...');

// Start Backend
const backend = spawn('node', ['index.js'], {
    cwd: path.join(__dirname, 'Backend', 'Expreserver'),
    stdio: 'inherit',
    shell: true
});

// Start Frontend
const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'Frontend'),
    stdio: 'inherit',
    shell: true
});

// Cleanly kill both processes on exit
process.on('SIGINT', () => {
    console.log('\nStopping servers...');
    backend.kill();
    frontend.kill();
    process.exit();
});
