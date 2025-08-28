import pool from '../config/database.js';
import bcrypt from 'bcrypt';

const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Starting database initialization...');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        data_nascimento DATE NOT NULL,
        endereco TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('viewer', 'creator')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS dashboards (
        id SERIAL PRIMARY KEY,
        classe VARCHAR(100) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        iframe TEXT NOT NULL,
        link TEXT NOT NULL,
        link_mobile TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_dashboards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        dashboard_id INTEGER REFERENCES dashboards(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, dashboard_id)
      );
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_dashboards_user_id ON user_dashboards(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_dashboards_dashboard_id ON user_dashboards(dashboard_id);');

    // Insert default admin user
    const adminEmail = 'admin@duofuturo.com';
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('DuoFuturo123!', 12);
      
      await client.query(`
        INSERT INTO users (username, password, nome, email, data_nascimento, endereco, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'admin',
        hashedPassword,
        'Administrador DuoFuturo',
        adminEmail,
        '1990-01-01',
        'São Paulo, SP - Brasil',
        'creator'
      ]);
      
      console.log('Default admin user created');
    }

    // Insert default dashboards
    const dashboards = [
      {
        classe: 'Mercado Financeiro',
        nome: 'Petróleo e Gás - Balanço',
        iframe: 'https://prod-useast-a.online.tableau.com/t/futurondataview/views/Petrobras_Balano/Balao',
        link: 'https://prod-useast-a.online.tableau.com/t/futurondataview/views/Petrobras_Balano/Balao',
        link_mobile: 'https://prod-useast-a.online.tableau.com/t/futurondataview/views/Petrobras_Balano/Balao'
      },
      {
        classe: 'Brand Analysis',
        nome: 'Reclame Aqui - Análise',
        iframe: 'https://prod-useast-a.online.tableau.com/t/futurondataview/views/Petrobras_ReclameAqui/ReclameAqui-Pessoal',
        link: 'https://prod-useast-a.online.tableau.com/t/futurondataview/views/Petrobras_ReclameAqui/ReclameAqui-Pessoal',
        link_mobile: 'https://prod-useast-a.online.tableau.com/t/futurondataview/views/Petrobras_ReclameAqui/ReclameAqui-Pessoal'
      }
    ];

    for (const dashboard of dashboards) {
      const existingDashboard = await client.query('SELECT id FROM dashboards WHERE nome = $1', [dashboard.nome]);
      
      if (existingDashboard.rows.length === 0) {
        await client.query(`
          INSERT INTO dashboards (classe, nome, iframe, link, link_mobile)
          VALUES ($1, $2, $3, $4, $5)
        `, [dashboard.classe, dashboard.nome, dashboard.iframe, dashboard.link, dashboard.link_mobile]);
        
        console.log(`Dashboard "${dashboard.nome}" created`);
      }
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run if called directly
if (process.argv[1].endsWith('initDb.js')) {
  initDatabase()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

export default initDatabase;