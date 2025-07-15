import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import KafkaProducer from './kafka-producer.js';

const app = express();
const port = process.env.PORT || 3000;

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Kafka producer with configuration
const kafkaProducer = new KafkaProducer({
  brokers: 'localhost:29092',
  clientId: 'node-kafka-api-producer',
  requestTimeout: 30000,
  messageTimeout: 60000
});

// Initialize and connect to Kafka
kafkaProducer.init()
  .then(() => {
    console.log('Kafka producer initialized and connected');
    
    // API Routes
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Kafka Producer API' });
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'UP',
        kafka: kafkaProducer.isConnected ? 'CONNECTED' : 'DISCONNECTED'
      });
    });

    // Send message to Kafka
    app.post('/api/messages', (req, res) => {
      try {
        const { topic, message, key } = req.body;
        
        if (!topic) {
          return res.status(400).json({ error: 'Topic is required' });
        }
        
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }
        
        const result = kafkaProducer.sendMessage(topic, message, key || null);
        res.status(200).json(result);
      } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
          error: 'Failed to send message to Kafka',
          details: error.message
        });
      }
    });

    // Send message to specific topic
    app.post('/api/topics/:topic', (req, res) => {
      try {
        const { topic } = req.params;
        const { message, key } = req.body;
        
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }
        
        const result = kafkaProducer.sendMessage(topic, message, key || null);
        res.status(200).json(result);
      } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
          error: 'Failed to send message to Kafka',
          details: error.message
        });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize Kafka producer:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

async function handleShutdown() {
  console.log('Server shutdown initiated...');
  
  try {
    await kafkaProducer.gracefulShutdown();
    console.log('Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}
