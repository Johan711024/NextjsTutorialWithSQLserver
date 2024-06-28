'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { doSqlQuery } from './database'

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })
    const amountInCents = amount * 100
    const date = new Date().toISOString().split('T')[0]

    try {
        //insert the new invoice into the database
        await doSqlQuery(`INSERT INTO invoices (customer_id, amount, status, date)
    VALUES ('${customerId}', ${amountInCents}, '${status}', '${date}')`)
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        }
    }
    //clears the cache for the invoices route and trigger new request on server
    revalidatePath('/dashboard/invoices')

    //...and redirect to the invoices page
    redirect('/dashboard/invoices')
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })

    const amountInCents = amount * 100

    try {
        await doSqlQuery(`
      UPDATE invoices
      SET customer_id = '${customerId}', amount = ${amountInCents}, status = '${status}'
      WHERE id = '${id}'
    `)
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' }
    }

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
    //throw new Error('Failed to Delete Invoice')

    try {
        await doSqlQuery(`DELETE FROM invoices WHERE id = '${id}'`)
        revalidatePath('/dashboard/invoices')
        return { message: 'Deleted Invoice.' }
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice.' }
    }
}
