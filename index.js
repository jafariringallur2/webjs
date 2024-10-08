const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const client = new Client({
    authStrategy: new LocalAuth()
});

let qrCodeData = '';

client.on('qr', (qr) => {
    qrCodeData = qr;
});

client.on('ready', () => {
    console.log('Client is ready!');
      const chatId = '919605882981@c.us';
    client.sendMessage(chatId, 'Hello from WhatsApp Web JS!').then(response => {
        console.log('Message sent:', response);
    }).catch(err => {
        console.error('Error when sending message:', err);
    });
});

client.on('authenticated', () => {
    console.log('Authenticated successfully!');
    qrCodeData = '';
});

app.get('/', (req, res) => {
    if (qrCodeData) {
        qrcode.toDataURL(qrCodeData, (err, src) => {
            if (err) res.send("Error occurred");

            res.send(`
                <html>
                <body style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column;">
                    <h2>Scan the QR code with WhatsApp</h2>
                    <img src="${src}" alt="QR code">
                    <br>
                    <a href="/logout">Logout</a>
                </body>
                </html>
            `);
        });
    } else {
        res.send(`
            <html>
            <body style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column;">
                <h2>Already authenticated.</h2>
                <a href="/logout">Logout</a>
            </body>
            </html>
        `);
    }
});

app.get('/logout', (req, res) => {
    // Manually clear session data
    const sessionPath = path.join(__dirname, 'node_modules', 'whatsapp-web.js', 'local-auth');
    if (fs.existsSync(sessionPath)) {
        fs.rmdirSync(sessionPath, { recursive: true });
    }

    // Restart client and clear QR code data
    client.destroy().then(() => {
        client.initialize();
        qrCodeData = '';
        res.redirect('/');
    }).catch((err) => {
        console.error('Error during logout:', err);
        res.send('Failed to logout.');
    });
});
app.get('/test', (req, res) => {
 const chatId = '919605882981@c.us';
    client.sendMessage(chatId, 'Hello from WhatsApp Web JS!').then(response => {
        return "Message sent"
    }).catch(err => {
        return err;
    });
      return "OK"
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

client.initialize();
