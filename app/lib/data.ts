import { sql } from '@vercel/postgres'
import { Connection, ConnectionPromises } from 'msnodesqlv8/types'
import dbConnect from '../../utils/dbConnect'

import {
    CustomerField,
    CustomersTableType,
    InvoiceForm,
    InvoicesTable,
    LatestInvoiceRaw,
    User,
    Revenue,
} from './definitions'
import { formatCurrency } from './utils'

async function getConnection(): Promise<ConnectionPromises> {
    const sql = dbConnect()
    console.log(`[dashboard] opening connection`)
    const con: Connection = await sql.driver.promises.open(sql.connStr)
    return con.promises
}

export async function fetchRevenue() {
    // Add noStore() here to prevent the response from being cached.
    // This is equivalent to in fetch(..., {cache: 'no-store'}).

    try {
        // Artificially delay a response for demo purposes.
        // Don't do this in production :)

        console.log('Fetching revenue data...')
        await new Promise(resolve => setTimeout(resolve, 3000))

        const promises: ConnectionPromises = await getConnection()
        const sqlQuery = 'SELECT * FROM dbo.revenue'
        const data = await promises.query(sqlQuery)
        const revenue: Revenue[] = data.first
        return revenue

        //const data = await sql<Revenue>`SELECT * FROM revenue`

        // console.log('Data fetch completed after 3 seconds.');

        //return data.rows
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch revenue data.')
    }
}

export async function fetchLatestInvoices() {
    try {
        const promises: ConnectionPromises = await getConnection()
        const sqlQuery = `SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      OFFSET 0 ROWS
      FETCH NEXT 5 ROWS ONLY
      `

        const q = await promises.query(sqlQuery)
        const data = q.first
        //const data = q.first.slice(0, 5) //first 5 rows

        //   const data2 = await sql<LatestInvoiceRaw>`
        // SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
        // FROM invoices
        // JOIN customers ON invoices.customer_id = customers.id
        // ORDER BY invoices.date DESC
        // LIMIT 5`

        const latestInvoices = data.map(invoice => ({
            ...invoice,
            amount: formatCurrency(invoice.amount),
        }))
        return latestInvoices
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch the latest invoices.')
    }
}

export async function fetchCardData() {
    try {
        // You can probably combine these into a single SQL query
        // However, we are intentionally splitting them to demonstrate
        // how to initialize multiple queries in parallel with JS.

        const promises: ConnectionPromises = await getConnection()
        //const invoiceCountPromise = `SELECT COUNT(*) FROM invoices`
        const invoiceCountPromise = await promises.query(`SELECT COUNT(*) FROM invoices`)
        const customerCountPromise = await promises.query(`SELECT COUNT(*) FROM customers`)
        const invoiceStatusPromise = await promises.query(`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`)

        const data = [invoiceCountPromise, customerCountPromise, invoiceStatusPromise]

        // const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`
        // const customerCountPromise = sql`SELECT COUNT(*) FROM customers`
        // const invoiceStatusPromise = sql`SELECT
        //  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        //  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
        //  FROM invoices`

        //const data = await Promise.all([invoiceCountPromise, customerCountPromise, invoiceStatusPromise])

        const numberOfInvoices = Number(Object.values(data[0].first[0]) ?? '0')
        const numberOfCustomers = Number(Object.values(data[1].first[0]) ?? '0')
        console.log(Object.values(data[0].first[0]))
        const totalPaidInvoices = formatCurrency(data[2].first[0].paid ?? '0')
        const totalPendingInvoices = formatCurrency(data[2].first[0].pending ?? '0')

        return {
            numberOfCustomers,
            numberOfInvoices,
            totalPaidInvoices,
            totalPendingInvoices,
        }
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch card data.')
    }
}

const ITEMS_PER_PAGE = 6
export async function fetchFilteredInvoices(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    try {
        const promises: ConnectionPromises = await getConnection()

        const sqlQuery = `SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name LIKE '${`%${query}%`}' OR
        customers.email LIKE '${`%${query}%`}' OR
        invoices.amount LIKE '${`%${query}%`}' OR
        invoices.date LIKE '${`%${query}%`}' OR
        invoices.status LIKE '${`%${query}%`}'
      ORDER BY invoices.date DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${ITEMS_PER_PAGE} ROWS ONLY
      `
        console.log(sqlQuery)
        const data = await promises.query(sqlQuery)
        const invoices = data.first
        return invoices

        /*  const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `*/
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch invoices.')
    }
}

export async function fetchInvoicesPages(query: string) {
    try {
        const promises: ConnectionPromises = await getConnection()

        const sqlQuery = `SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name LIKE '${`%${query}%`}' OR
      customers.email LIKE '${`%${query}%`}' OR
      invoices.amount LIKE '${`%${query}%`}' OR
      invoices.date LIKE '${`%${query}%`}' OR
      invoices.status LIKE '${`%${query}%`}'
  `

        const data = await promises.query(sqlQuery)
        //const count = data.first
        const count = Number(Object.values(data.first[0]) ?? '0')
        console.log('COUNT', count)

        /*   const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `*/

        const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE)
        return totalPages
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch total number of invoices.')
    }
}

export async function fetchInvoiceById(id: string) {
    try {
        const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `

        const invoice = data.rows.map(invoice => ({
            ...invoice,
            // Convert amount from cents to dollars
            amount: invoice.amount / 100,
        }))

        return invoice[0]
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch invoice.')
    }
}

export async function fetchCustomers() {
    try {
        const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `

        const customers = data.rows
        return customers
    } catch (err) {
        console.error('Database Error:', err)
        throw new Error('Failed to fetch all customers.')
    }
}

export async function fetchFilteredCustomers(query: string) {
    try {
        const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `

        const customers = data.rows.map(customer => ({
            ...customer,
            total_pending: formatCurrency(customer.total_pending),
            total_paid: formatCurrency(customer.total_paid),
        }))

        return customers
    } catch (err) {
        console.error('Database Error:', err)
        throw new Error('Failed to fetch customer table.')
    }
}

export async function getUser(email: string) {
    try {
        const user = await sql`SELECT * FROM users WHERE email=${email}`
        return user.rows[0] as User
    } catch (error) {
        console.error('Failed to fetch user:', error)
        throw new Error('Failed to fetch user.')
    }
}
