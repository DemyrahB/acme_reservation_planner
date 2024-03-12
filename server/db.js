const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL||'postgres://localhost/acme_reservation_planner')
const uuid = require('uuid')
const createTables = async ()=>{
    const SQL = `
    DROP TABLE IF EXISTS customer CASCADE;
    DROP TABLE IF EXISTS restaurant CASCADE;
    DROP TABLE IF EXISTS reservation;
    CREATE TABLE customer(
        id UUID PRIMARY KEY,
        name VARCHAR (255) NOT NULL
    );
    CREATE TABLE restaurant(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR (255) NOT NULL
    );
    CREATE TABLE reservation(
        id UUID PRIMARY KEY,
        date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES restaurant(id) NOT NULL,
        customer_id UUID REFERENCES customer(id) NOT NULL
    );
    `
    const response = await client.query(SQL)
    
}

const createCustomer = async(name)=>{
    const SQL = `
        INSERT INTO customer(id, name) 
        VALUES($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL,[uuid.v4(), name]);
    return response.rows[0];
}

const createRestaurant = async (name)=>{
    const SQL = `
        INSERT INTO restaurant(id, name)
        VALUES($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
}

const fetchCustomer = async()=>{
    const SQL = `
    SELECT * 
    FROM customer
    `;
    const response = await client.query(SQL)
    return response.rows
}

const fetchRestaurant = async()=>{
    const SQL = `
    SELECT * 
    FROM restaurant
    `;
    const response = await client.query(SQL)
    return response.rows
}

const createReservation = async({date, party_count, restaurant_id, customer_id})=>{
    const SQL = `
    INSERT INTO reservation(id, date, party_count, restaurant_id, customer_id)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `
    const response = await client.query(SQL, [uuid.v4(), date, party_count, restaurant_id, customer_id])
    return response.rows[0]
}

const fetchReservation = async()=>{
    const SQL = `
    SELECT * 
    FROM reservation
    `;
    const response = await client.query(SQL)
    return response.rows
}

const destroyReservation = async(id)=>{
    const SQL = `
    DELETE FROM reservation
    WHERE id = $1
    `;
    const response = await client.query(SQL, [id])
}


module.exports = {client, createTables, createCustomer, createRestaurant, fetchCustomer, fetchRestaurant, createReservation, fetchReservation, destroyReservation};