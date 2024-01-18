const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()


// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7dcoggr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // create a collections of documents
        const bookCollections = client.db('BookInventory').collection('books')

        // insert a book to the db: post method
        app.post('/upload-book', async (req, res) => {
            const data = req.body;
            const result = await bookCollections.insertOne(data);
            res.send(result)
        })

        // get all books from the database
        // app.get('/all-books', async (req, res) => {
        //     const books = bookCollections.find();
        //     const result = await books.toArray();
        //     res.send(result);
        // })

        // get single book from data
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const result = await bookCollections.findOne(filter);
            res.send(result);
        })

        // update a book data: patch or update methods
        app.patch('/update-book/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateBook = {
                $set: {
                    ...data
                }
            }
            const options = { upsert: true }
            const result = await bookCollections.updateOne(filter, updateBook, options);
            res.send(result);
        })

        // delete a book from the database
        app.delete('/delete-book/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await bookCollections.deleteOne(filter);
            res.send(result);
        })

        // get books using query
        app.get('/all-books', async (req, res) => {
            let query = {};
            if (req.query?.category){
                query = { category: req.query.category }
            }
            const result = await bookCollections.find(query).toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})