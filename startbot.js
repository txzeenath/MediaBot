const { spawn } = require('child_process');

function startBot() {
    const bot = spawn('node', ['index.js'], { stdio: 'inherit' });

    bot.on('close', (code) => {
        console.log(`Bot process exited with code ${code}. Restarting...`);
        startBot();
    });
}

startBot();
