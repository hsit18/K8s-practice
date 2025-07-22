// Kafka consumer example using @confluentinc/kafka-javascript
import { RdKafka } from '@confluentinc/kafka-javascript';

// Configuration
const config = {
  'bootstrap.servers': '127.0.0.1:29092,127.0.0.1:29093', // Use IPv4 explicitly for both brokers
  'group.id': 'node-consumer-group',
  'enable.auto.commit': false,
  'session.timeout.ms': 30000,
  'heartbeat.interval.ms': 10000,
  'auto.offset.reset': 'earliest',
  'broker.address.family': 'v4', // Force IPv4
};

console.log('Creating Kafka consumer...');

// Create consumer instance
const consumer = new RdKafka.KafkaConsumer(config);

// Register event handlers
consumer.on('ready', () => {
  console.log('Consumer ready. Connected to Kafka!');
  
  // Subscribe to topic
  const topic = 'test-topic';
  consumer.subscribe([topic]);
  
  // Start consuming
  consumer.consume();
  console.log(`Subscribed to ${topic} and waiting for messages...`);
});

consumer.on('data', (message) => {
  // Output the message content
  console.log('Received message:');
  console.log({
    topic: message.topic,
    partition: message.partition,
    offset: message.offset,
    key: message.key ? message.key.toString() : null,
    timestamp: message.timestamp,
    value: message.value.toString()
  });
  
  // Commit the message offset
  consumer.commit(message);
});

consumer.on('event.error', (err) => {
  console.error('Error from consumer:', err);
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    errno: err.errno,
    origin: err.origin
  });
});

consumer.on('event.log', (log) => {
  console.log('Consumer log:', log);
});

consumer.on('disconnected', () => {
  console.log('Consumer disconnected');
});

// Set up clean exit
process.on('SIGINT', () => {
  console.log('Disconnecting consumer...');
  consumer.disconnect();
});

// Connect to Kafka
console.log('Connecting to Kafka...');
consumer.connect();
