// background.js
console.log('Background script loaded');

let ws = null;
let isConnecting = false;

function connectToServer() {
    if (isConnecting || (ws && ws.readyState === WebSocket.OPEN)) {
        return;
    }

    isConnecting = true;
    ws = new WebSocket('ws://localhost:6969');

    ws.onopen = () => {
        console.log("Connected to server");
        isConnecting = false;
    };

    ws.onclose = () => {
        console.log("Disconnected from server");
        isConnecting = false;
        ws = null;
        // Attempt to reconnect after 5 seconds
        setTimeout(connectToServer, 5000);
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        isConnecting = false;
    };

    ws.onmessage = (event) => {
        console.log("Received message from server:", event.data);
    };
}

function sendWSMessage(message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        connectToServer();
        // Queue the message to be sent after connection
        setTimeout(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            } else {
                console.error("Failed to send message - connection not established");
            }
        }, 1000);
        return;
    }

    try {
        ws.send(message);
    } catch (error) {
        console.error("Failed to send message:", error);
    }
}

const submitInfo = async (rows) => {
    console.log(rows[4].toString());
    console.log(rows[5].toString());
    // Create the content you want to write
    const newLine = `${rows[4]},${rows[5]}\n`;  // Example: formatting as CSV
    sendWSMessage(newLine);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'tableData') {
        console.log('Received table data:', message.data);
        console.log(message.data[0].rows);
        const rows = message.data[0].rows;
        // Process rows
        (async () => {
            for (const row of rows) {
                if (row[0] === 'type' && row[1] === 'STAR') {
                    await submitInfo(rows);
                }
            }
        })();
    }
});

// Initialize connection when the background script loads
connectToServer();
