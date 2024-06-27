
const  db  = require('mssql/msnodesqlv8');
var dbConfig = require('./msSqlConn/dbConfig.js');

const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

async function seedUsers(client) {
  try{
    //await  client.request().query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    const createTable = await client.request().query`IF OBJECT_ID(N'Users', N'U') IS NULL
      CREATE TABLE Users (
    id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL    
);
    `;

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.request().query`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword});
      `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };

  }
  catch (error) {
    console.log('Error creating table:', error);
}
  console.log(`Created "users" table`);

}

async function seedCustomers(client) {
  try {
    
    // Create the "customers" table if it doesn't exist
    const createTable = await client.request().query`IF OBJECT_ID(N'customers', N'U') IS NULL 
      CREATE TABLE customers (
        id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
        name varchar(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;

    console.log(`Created "customers" table`);

    // Insert data into the "customers" table
    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => client.request().query`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url});
      `,
      ),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);

    return {
      createTable,
      customers: insertedCustomers,
    };
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}


async function seedInvoices(client) {
  try {
    

    // Create the "invoices" table if it doesn't exist
    const createTable = await client.request().query`IF OBJECT_ID(N'invoices', N'U') IS NULL
    CREATE TABLE invoices (
    id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    customer_id uniqueidentifier NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    date DATE NOT NULL
  );
`;

    console.log(`Created "invoices" table`);

    // Insert data into the "invoices" table
    const insertedInvoices = await Promise.all(
      invoices.map(
        (invoice) => client.request().query`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date});
      `,
      ),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return {
      createTable,
      invoices: insertedInvoices,
    };
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedRevenue(client) {
  try {
    // Create the "revenue" table if it doesn't exist
    const createTable = await client.request().query`IF OBJECT_ID(N'revenue', N'U') IS NULL
      CREATE TABLE revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;

    console.log(`Created "revenue" table`);

    // Insert data into the "revenue" table
    const insertedRevenue = await Promise.all(
      revenue.map(
        (rev) => client.request().query`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue});
      `,
      ),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return {
      createTable,
      revenue: insertedRevenue,
    };
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}



async function main() {

  let pool = await db.connect(dbConfig); 

  //await getOrders(pool);
  await seedUsers(pool);
  await seedCustomers(pool);
  await seedInvoices(pool);
  await seedRevenue(pool);

  await pool.close();


  // await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
