const express = require('express')
const app = express()
app.use(require('morgan')('dev'))
app.use(express.json())
const port = 3000
const {client, createTables, createCustomer, createRestaurant, fetchCustomer, fetchRestaurant, createReservation, fetchReservation, destroyReservation} = require('./db')

const init = async ()=>{
    await client.connect()
    await createTables()
    const [Abby, Brian, Carla, David, Hibachi, Chipotle, Subway, Starbucks] = await Promise.all([
        createCustomer('Abby'),
        createCustomer('Brian'),
        createCustomer('Carla'),
        createCustomer('David'),
        createRestaurant('Hibachi'), 
        createRestaurant('Chipotle'),
        createRestaurant('Subway'),
        createRestaurant('Starbucks')
    ]);
    console.log(await fetchCustomer());
    console.log(await fetchRestaurant());
    await Promise.all([
        createReservation({ date: '4/25/2024', party_count: 8, restaurant_id: Hibachi.id, customer_id: Abby.id}),
        createReservation({ date: '5/25/2024', party_count: 10, restaurant_id: Chipotle.id, customer_id: Brian.id}),
        createReservation({ date: '6/25/2024', party_count: 5, restaurant_id: Subway.id, customer_id: Carla.id}),
        createReservation({ date: '7/25/2024', party_count: 2, restaurant_id: Starbucks.id, customer_id: David.id})
    ])
    const reservation = await fetchReservation()
    await destroyReservation(reservation[0].id)
    console.log(await fetchReservation())
    app.listen(port, ()=>{
        console.log("You are connected at port " +port+ " and the database is seeded")
    })

}
app.get('/api/customers', async(req, res, next) => {
    try {
        res.send(await fetchCustomer())
    } catch (ex) {
        next(ex)
    }
});

app.get('/api/restaurants', async (req, res, next) => {
    try {
        res.send(await fetchRestaurant())
    } catch (ex) {
        next(ex)
    }
})

app.get('/api/reservations', async (req, res, next) => {
    try {
        res.send(await fetchReservation())
    } catch (ex) {
        next(ex)
    }
})

app.delete('/api/reservations/:id', async(req, res, next) => {
    try {
        await destroyReservation(req.params.id)
        res.sendStatus(204)
    } catch (ex) {
        next(ex)
    }
})

app.post('/api/reservations', async (req, res, next) => {
    try {
        res.status(201).send(await createReservation(req.body))
    } catch (ex) {
        next(ex)
    }
})

init()