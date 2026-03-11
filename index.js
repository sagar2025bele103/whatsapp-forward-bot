require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
    console.log('Listening for messages from: Rajasthan Vacancy 37');
    console.log('Forwarding to: Exam Alert-01, Exam Alert-02');
});

client.on('message', async msg => {
    try {
        const sourceGroup = 'Rajasthan Vacancy 37';
        const targetGroups = ['Exam Alert-01', 'Exam Alert-02'];
        const chat = await msg.getChat();

        if (chat.name === sourceGroup) {
            console.log(`Message received from ${sourceGroup}: "${msg.body}"`);
            
            const contact = await msg.getContact();
            const senderName = contact.pushname || contact.name || 'Unknown';
            const forwardedMsg = `From ${senderName}:\n\n${msg.body}`;

            const chats = await client.getChats();
            for (let groupName of targetGroups) {
                const targetChat = chats.find(c => c.name === groupName);
                if (targetChat) {
                    await client.sendMessage(targetChat.id._serialized, forwardedMsg);
                    console.log(`Forwarded to ${groupName}`);
                } else {
                    console.log(`Group "${groupName}" not found`);
                }
            }
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

client.on('auth_failure', msg => {
    console.error('Authentication failed:', msg);
});

client.on('disconnected', reason => {
    console.log('Disconnected:', reason);
});

client.initialize();