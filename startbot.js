const { spawn } = require('child_process');

function startBot() {
    const bot = spawn('node', ['index.js']);

    bot.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    bot.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    bot.on('close', (code) => {
        console.log(`Bot process exited with code ${code}. Restarting...`);
        startBot();
    });
}

startBot();
