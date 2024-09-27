const express=require('express');
const mongoose=require('mongoose');
const bodyParser =require('body-parser');
var cors = require('cors');
const axios = require('axios');
const categories=require('./routes/categories');
const app=express();

app.use(cors());
require('dotenv').config();
const mongourl=process.env.database;
//work as a middleware
app.use(bodyParser.json());
//mongoose.connect
mongoose.connect(mongourl)
.then(()=>console.log('mongoDb contted'))
.catch(err=>console.log(err));

app.use(express.json());
//routes



app.use('/api',categories);
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log(`server conected on part ${PORT}`))
