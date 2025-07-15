import { RdKafka } from '@confluentinc/kafka-javascript';

// Kafka producer module
export class KafkaProducer {
  constructor(options = {}) {
    this.config = {
      'bootstrap.servers': options.brokers || 'localhost:29092',
      'client.id': options.clientId || 'node-kafka-producer',
      'dr_cb': true,
      'socket.keepalive.enable': true,
      'request.timeout.ms': options.requestTimeout || 30000,
      'message.timeout.ms': options.messageTimeout || 60000
    };
    
    this.isConnected = false;
    this.producer = null;
    this.connectPromise = null;
  }
  
  init() {
    console.log('Creating Kafka producer...');
    
    this.producer = new RdKafka.Producer(this.config);
    
    // Setup event handlers
    this._setupEventHandlers();
    
    // Connect to Kafka
    return this.connect();
  }

  _setupEventHandlers() {
    const producer = this.producer;
    const self = this;
    
    producer.on('ready', () => {
      console.log('Producer ready. Connected to Kafka!');
      self.isConnected = true;
      
      if (self.connectResolve) {
        self.connectResolve();
      }
    });
    
    producer.on('delivery-report', (err, report) => {
      if (err) {
        console.error('Delivery error:', err);
      } else {
        console.log('Message delivered:', report);
      }
    });
    
    producer.on('event.error', (err) => {
      console.error('Error from producer:', err);
      
      if (err.message && err.message.includes('broker transport failure')) {
        console.log('Broker connection issue detected. Make sure Kafka is running');
      }
      
      if (self.connectReject && !self.isConnected) {
        self.connectReject(err);
      }
    });
    
    producer.on('disconnected', () => {
      console.log('Producer disconnected');
      self.isConnected = false;
    });
    
    producer.on('connection.failure', (err, metadata) => {
      console.error('Connection failure:', err);
      console.log('Connection metadata:', metadata);
    });
  }

  connect() {
    if (this.connectPromise) {
      return this.connectPromise;
    }
    
    this.connectPromise = new Promise((resolve, reject) => {
      this.connectResolve = resolve;
      this.connectReject = reject;
      
      console.log('Connecting to Kafka...');
      this.producer.connect();
      
      // Set a timeout to reject if connection takes too long
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
    
    return this.connectPromise;
  }

  sendMessage(topic, message, key = null) {
    if (!this.isConnected) {
      throw new Error('Kafka producer not connected');
    }

    try {
      this.producer.produce(
        topic,
        null,
        Buffer.from(typeof message === 'string' ? message : JSON.stringify(message)),
        key,
        Date.now()
      );
      
      try {
        this.producer.poll();
        console.log('Poll completed successfully');
      } catch (pollError) {
        console.error('Error during poll operation:', pollError);
        throw pollError;
      }
      
      return { success: true, message: 'Message sent to Kafka' };
    } catch (error) {
      console.error('Failed to produce message:', error);
      throw error;
    }
  }

  gracefulShutdown() {
    return new Promise((resolve) => {
      console.log('Graceful shutdown initiated...');
      
      if (this.isConnected) {
        console.log('Flushing pending messages and disconnecting producer...');
        
        this.producer.flush(10000, (err) => {
          console.log('Producer flush completed');
          this.producer.disconnect();
          console.log('Shutdown complete');
          resolve();
        });
      } else {
        console.log('No active connection to disconnect');
        resolve();
      }
    });
  }
}

export default KafkaProducer;
