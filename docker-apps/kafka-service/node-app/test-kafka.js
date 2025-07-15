// test-kafka.js
// Simple script to test Kafka connection using the Confluent Kafka JavaScript library
import { RdKafka } from '@confluentinc/kafka-javascript';

console.log('Starting Kafka connection test...');

// Create a producer instance to test the connection
const producer = new RdKafka.Producer({
  'bootstrap.servers': 'localhost:29092',  // Using the OUTSIDE listener
  'client.id': 'kafka-test-client',
  'debug': 'broker,topic,msg'
});

console.log('Created producer client, connecting...');

// Connect to Kafka
producer.connect();

// Listen for connection events
producer.on('ready', () => {
  console.log('Producer connected to Kafka cluster successfully!');
  
  // Get broker metadata
  producer.getMetadata({
    topic: null,  // null means get metadata for all topics
    timeout: 10000
  }, (err, metadata) => {
    if (err) {
      console.error('Error getting metadata:', err);
    } else {
      console.log('Kafka Cluster Information:');
      console.log(`Broker Count: ${metadata.brokers.length}`);
      
      console.log('\nBrokers:');
      metadata.brokers.forEach(broker => {
        console.log(`  ID: ${broker.id}, Host: ${broker.host}, Port: ${broker.port}`);
      });
      
      console.log('\nTopics:');
      metadata.topics.forEach(topic => {
        console.log(`  Topic: ${topic.name}, Partitions: ${topic.partitions.length}`);
      });
    }
    
    // Disconnect when done
    producer.disconnect();
  });
});

producer.on('event.error', (err) => {
  console.error('Kafka connection error:', err);
});

producer.on('disconnected', () => {
  console.log('Producer disconnected from Kafka');
  process.exit(0);
});
