const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()

// middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rmxtse.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const jobsCollection = client.db('soloSphere').collection('jobs')

        // Get all jobs data from db
        app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().toArray()
            res.send(result)
        })


        // Get all jobs data from db for pagination
    app.get('/all-jobs', async (req, res) => {
        const size = parseInt(req.query.size)
        const page = parseInt(req.query.page) - 1
        const filter = req.query.filter
        const sort = req.query.sort
        const search = req.query.search
        console.log(size, page)
  
        let query = {
          job_title: { $regex: search, $options: 'i' },
        }
        if (filter) query.category = filter
        let options = {}
        if (sort) options = { sort: { deadline: sort === 'asc' ? 1 : -1 } }
        const result = await jobsCollection
          .find(query, options)
          .skip(page * size)
          .limit(size)
          .toArray()
  
        res.send(result)
      })
  
      // Get all jobs data count from db
      app.get('/jobs-count', async (req, res) => {
        const filter = req.query.filter
        const search = req.query.search
        let query = {
          job_title: { $regex: search, $options: 'i' },
        }
        if (filter) query.category = filter
        const count = await jobsCollection.countDocuments(query)
  
        res.send({ count })
      })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from soloSphere Server...')
})

app.listen(port, () => console.log(`Server running on port ${port}`))