const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

let items = [];

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Express CRUD Application!');
});

// POST endpoint to add a new item
app.post('/items', (req, res) => {
    const item = req.body;
    items.push(item);
    res.status(201).send('Item added');
});

// GET endpoint to retrieve all items
app.get('/items', (req, res) => {
    res.json(items);
});

// GET endpoint to retrieve a specific item by ID
app.get('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = items.find(i => i.id === id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).send('Item not found');
    }
});

// PUT endpoint to update an existing item
app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
        items[index] = req.body;
        res.send('Item updated');
    } else {
        res.status(404).send('Item not found');
    }
});

// DELETE endpoint to remove an item
app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
        items.splice(index, 1);
        res.send('Item deleted');
    } else {
        res.status(404).send('Item not found');
    }
});

module.exports = app;
