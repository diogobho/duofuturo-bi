import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'duofuturo_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'duofuturo_bi',
  password: process.env.DB_PASSWORD || '144246',
  port: parseInt(process.env.DB_PORT || '5432'),
});

export default pool;
