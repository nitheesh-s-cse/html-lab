/**
 * ============================================================================
 * VIJAYKUMAR'S MUTTA BONDA SHOP - NEON POSTGRESQL COMMAND LINE TOOL (db_cli.js)
 * ============================================================================
 * 
 * ABOUT THIS PROGRAM:
 * ----------------------------------------------------------------------------
 * This Node.js program connects directly to Neon PostgreSQL database using HTTPS.
 * It provides a command-line interface (CLI) to manage food orders, test database
 * connectivity, view database statistics, and inspect the database schema.
 * 
 * COMMAND LINE SUMMARY:
 * ----------------------------------------------------------------------------
 * 1.  node db_cli.js --help    : Display this help guide and list of all commands
 * 2.  node db_cli.js --test    : Test Neon PostgreSQL database connection
 * 3.  node db_cli.js --list    : Display all customer orders stored in database
 * 4.  node db_cli.js --stats   : View total orders, revenue sales, and top items
 * 5.  node db_cli.js --menu    : View full Vijaykumar's Mutta Bonda Shop Menu
 * 6.  node db_cli.js --schema  : View PostgreSQL database table structure/schema
 * 7.  node db_cli.js --add     : Add a new order via command line
 * 8.  node db_cli.js --clear   : Delete/Truncate all orders from database
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env file safely
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const eqIndex = trimmed.indexOf('=');
      const key = trimmed.substring(0, eqIndex).trim();
      const val = trimmed.substring(eqIndex + 1).trim();
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

// Database Connection Settings for Neon PostgreSQL (Loaded from environment)
const DB_CONN_STRING = process.env.DATABASE_URL || 'postgresql://neondb_owner:CONFIGURED_PASSWORD@ep-square-dawn-azupdsqe-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const NEON_HTTP_ENDPOINT = process.env.NEON_HTTP_ENDPOINT || 'https://ep-square-dawn-azupdsqe-pooler.c-3.ap-southeast-1.aws.neon.tech/sql';

/**
 * Helper Function: executeQuery(sqlQuery)
 * Explanatory Note: Sends a SQL query string to Neon PostgreSQL via HTTPS POST endpoint.
 * Returns a Promise containing the SQL result rows and fields.
 */
function executeQuery(sqlQuery) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query: sqlQuery });
    const req = https.request(NEON_HTTP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Neon-Connection-String': DB_CONN_STRING,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error('Invalid JSON response from Neon DB: ' + body));
          }
        } else {
          reject(new Error(`Neon DB Error (HTTP ${res.statusCode}): ${body}`));
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(payload);
    req.end();
  });
}

/**
 * Function: printHelp()
 * Displays interactive command line guide for students & teachers.
 */
function printHelp() {
  console.log(`
================================================================================
          VIJAYKUMAR'S MUTTA BONDA SHOP - CLI COMMAND CENTER
================================================================================

Available Terminal Commands:

1. node db_cli.js --help
   --> Shows this help guide explaining how to use all commands.

2. node db_cli.js --test
   --> Tests the live connection to Neon PostgreSQL cloud database.

3. node db_cli.js --list
   --> Fetches and displays all orders stored in the 'orders' database table.

4. node db_cli.js --stats
   --> Shows live sales statistics (Total Orders, Total Revenue, Top Items).

5. node db_cli.js --menu
   --> Displays Vijaykumar's Mutta Bonda Shop full menu card with prices.

6. node db_cli.js --schema
   --> Displays the SQL schema (table structure) of the 'orders' table.

7. node db_cli.js --add "Name" "Phone" "Address" "Item" Quantity UnitPrice "Payment"
   --> Adds a new order directly into the Neon PostgreSQL database.
   Example:
   node db_cli.js --add "Ramesh" "9876543210" "Coimbatore" "Chicken Mutta Bonda" 2 60 "UPI"

8. node db_cli.js --clear
   --> Clears (truncates) all orders from the database.

================================================================================
`);
}

/**
 * Function: printMenu()
 * Prints the shop menu card in terminal.
 */
function printMenu() {
  console.log(`
================================================================================
                  VIJAYKUMAR'S MUTTA BONDA SHOP - MENU CARD
================================================================================

1. 🌟 SPECIAL BONDA:
   - Chicken Mutta Bonda          : ₹60

2. 🥬 VEG BONDA:
   - Kaara Bonda                  : ₹20
   - Keerai Bonda                 : ₹20
   - Murunga Keerai Bonda         : ₹25
   - Thandu Keerai Bonda          : ₹25
   - Paneer Bonda                 : ₹35
   - Cheese Bonda                 : ₹40

3. 🍖 NON-VEG BONDA:
   - Beef Bonda                   : ₹55
   - Mutton Bonda                 : ₹65

4. ☕ TEA:
   - Normal Tea                   : ₹10
   - Ginger Tea                   : ₹12
   - Black Tea                    : ₹10
   - Masala Tea                   : ₹15
   - Green Tea                    : ₹15

5. ☕ COFFEE & HOT DRINKS:
   - Filter Coffee                : ₹15
   - Bru Coffee                   : ₹15
   - Cold Coffee                  : ₹40
   - Boost                        : ₹20
   - Horlicks                     : ₹20
   - Badam Milk                   : ₹30

6. 🍹 JUICES:
   - Mint Juice                   : ₹25
   - Lemon Mint                   : ₹25
   - Watermelon Juice             : ₹30
   - Mosambi Juice                : ₹30
   - Fresh Lime Soda              : ₹20

7. 🎁 COMBO OFFERS:
   - Kaara Bonda + Chicken Mutta Bonda (Free Tea) : ₹80
   - Family Bonda Combo (Free Coke + Cupcake)      : ₹200

================================================================================
`);
}

/**
 * Main Application Runner
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ? args[0].toLowerCase() : '--help';

  try {
    // Step 1: Automatically ensure 'orders' table exists in Neon PostgreSQL
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        item_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL,
        total_price NUMERIC(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await executeQuery(createTableSql);

    // Step 2: Process Command Flags
    if (command === '--help') {
      printHelp();
    }
    else if (command === '--menu') {
      printMenu();
    }
    else if (command === '--test') {
      console.log('\n========================================');
      console.log('Testing Neon PostgreSQL Connection...');
      console.log('========================================');
      const res = await executeQuery('SELECT NOW() as db_time, current_database() as db_name, version() as db_version;');
      console.log('✅ Connection Status : SUCCESSFUL');
      console.log('Database Name     :', res.rows[0].db_name);
      console.log('Database Server Time:', res.rows[0].db_time);
      console.log('PostgreSQL Version  :', res.rows[0].db_version.split(',')[0]);
      console.log('========================================\n');
    }
    else if (command === '--list') {
      console.log('\n========================================');
      console.log('Fetching Orders from Neon PostgreSQL...');
      console.log('========================================');
      const res = await executeQuery('SELECT id, customer_name, phone_number, item_name, quantity, total_price, payment_method, created_at FROM orders ORDER BY id DESC;');
      if (res.rows && res.rows.length > 0) {
        console.table(res.rows);
        console.log(`Total Orders Found in Database: ${res.rows.length}`);
      } else {
        console.log('No orders found in the database. Place an order via basic5.html or run --add command!');
      }
      console.log('========================================\n');
    }
    else if (command === '--stats' || command === '--stat') {
      console.log('\n========================================');
      console.log('Neon Database Order Statistics Summary');
      console.log('========================================');
      const statsRes = await executeQuery('SELECT COUNT(*) as total_orders, COALESCE(SUM(total_price), 0) as total_revenue, COALESCE(SUM(quantity), 0) as total_items_sold FROM orders;');
      const topItemsRes = await executeQuery('SELECT item_name, SUM(quantity) as quantity_sold FROM orders GROUP BY item_name ORDER BY quantity_sold DESC LIMIT 3;');
      
      const stats = statsRes.rows[0];
      console.log('Total Orders Placed :', stats.total_orders);
      console.log('Total Items Sold    :', stats.total_items_sold);
      console.log('Total Sales Revenue :', `₹${parseFloat(stats.total_revenue).toFixed(2)}`);
      
      if (topItemsRes.rows && topItemsRes.rows.length > 0) {
        console.log('\nTop Selling Items:');
        console.table(topItemsRes.rows);
      }
      console.log('========================================\n');
    }
    else if (command === '--schema') {
      console.log('\n========================================');
      console.log('PostgreSQL Database Schema (orders table)');
      console.log('========================================');
      const schemaRes = await executeQuery(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'orders'
        ORDER BY ordinal_position;
      `);
      console.table(schemaRes.rows);
      console.log('========================================\n');
    }
    else if (command === '--add') {
      const name = args[1] || 'Suresh Kumar';
      const phone = args[2] || '9876543210';
      const address = args[3] || 'Thudiyalur, Coimbatore';
      const item = args[4] || 'Chicken Mutta Bonda';
      const qty = parseInt(args[5], 10) || 1;
      const unitPrice = parseFloat(args[6]) || 60.00;
      const totalPrice = qty * unitPrice;
      const payment = args[7] || 'UPI';

      const insertSql = `
        INSERT INTO orders (customer_name, phone_number, delivery_address, item_name, quantity, unit_price, total_price, payment_method)
        VALUES ('${name.replace(/'/g, "''")}', '${phone.replace(/'/g, "''")}', '${address.replace(/'/g, "''")}', '${item.replace(/'/g, "''")}', ${qty}, ${unitPrice}, ${totalPrice}, '${payment.replace(/'/g, "''")}')
        RETURNING id;
      `;
      const insertRes = await executeQuery(insertSql);
      const orderId = insertRes.rows && insertRes.rows[0] ? insertRes.rows[0].id : 'NEW';

      console.log('\n========================================');
      console.log(`✅ Order #${orderId} Added Successfully via CLI!`);
      console.log(`Customer: ${name} | Phone: ${phone}`);
      console.log(`Item    : ${item} x ${qty} @ ₹${unitPrice}`);
      console.log(`Total   : ₹${totalPrice} (${payment})`);
      console.log('========================================\n');
    }
    else if (command === '--clear') {
      await executeQuery('TRUNCATE TABLE orders;');
      console.log('\n========================================');
      console.log('✅ All Orders Cleared from Database!');
      console.log('========================================\n');
    }
    else {
      console.log(`Unknown command flag '${command}'. Use --help to see all available commands.`);
    }

  } catch (err) {
    console.error('❌ Error executing command:', err.message);
  }
}

// Execute the program
main();
