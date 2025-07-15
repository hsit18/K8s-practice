import { RdKafka } from '@confluentinc/kafka-javascript';

const config = {
  'bootstrap.servers': 'localhost:29092', // Verify this is the correct broker address
  'client.id': 'node-kafka-producer',
  'dr_cb': true,
  'socket.keepalive.enable': true,
  'request.timeout.ms': 30000, // Increase timeout to 30 seconds
  'message.timeout.ms': 60000  // Message delivery timeout
};

console.log('Creating Kafka producer...');

const producer = new RdKafka.Producer(config);
let isConnected = false;
producer.on('ready', () => {
  console.log('Producer ready. Connected to Kafka!');
  isConnected = true;
  sendMessage();
});

function sendMessage() {
  const topic = 'test-topic';
  
  const message = JSON.stringify({
    time: new Date().toISOString(),
    message: 'Hello from Node.js producer!',
    count: 1
  });
  
  try {
    producer.produce(
      topic,
      null,
      Buffer.from(message),
      'key1',
      Date.now()
    );
    
    console.log(`Message sent to topic ${topic}: ${message}`);
    
    try {
      producer.poll();
      console.log('Poll completed successfully');
    } catch (pollError) {
      console.error('Error during poll operation:', pollError);
    }
    
  } catch (err) {
    console.error('Error producing message:', err);
  }
}

producer.on('delivery-report', (err, report) => {
  if (err) {
    console.error('Delivery error:', err);
  } else {
    console.log('Message delivered:', report);
  }
});

producer.on('event.error', (err) => {
  console.error('Error from producer:', err);
});

producer.on('disconnected', () => {
  console.log('Producer disconnected');
  isConnected = false;
});

// Add event handler for connection errors
producer.on('connection.failure', (err, metadata) => {
  console.error('Connection failure:', err);
  console.log('Connection metadata:', metadata);
});
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
  console.log('Graceful shutdown initiated...');
  
  if (isConnected) {
    console.log('Flushing pending messages and disconnecting producer...');
    
    producer.flush(10000, (err) => {
      console.log('Producer flush completed');
      producer.disconnect();
      console.log('Shutdown complete');
      process.exit(0);
    });
  } else {
    console.log('No active connection to disconnect');
    process.exit(0);
  }
}

console.log('Connecting to Kafka...');
producer.connect();
