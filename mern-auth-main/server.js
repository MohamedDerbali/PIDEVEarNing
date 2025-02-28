require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser')

const productRoute = require("./routes/Marketplace/product");
const cartRoute = require("./routes/Marketplace/cart");
const orderRoute = require("./routes/Marketplace/order");
const stripeRoute = require("./routes/Marketplace/stripe");
const karaokeRoute = require("./routes/Karaoke/karaoke");
const courseRoute = require("./routes/Course/course");

const app = express();
var server = require('http').Server(app);

//!socket.io
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: [ "GET", "POST" ]
    }
})
let x=true;
io.on("connection", (socket) => {
    socket.emit("me", socket.id)
    /*io.of("/").adapter.on("create-room", (room) => {
        console.log(`room ${room} was created`);
    });*/
    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded");
        x=false;
    })

    socket.on("callUser", (data) => {

        io.to(data.userToCall).emit("callUser", {signal: data.signalData, from: data.from, name: data.name})

    })

    socket.on("answerCall", (data) => {

        io.to(data.to).emit("callAccepted", data.signal)

        /*io.of("/").adapter.on("join-room", (room, id) => {
            console.log(`socket ${id} has joined room ${room}`);
        });*/
    })
})





//!middlewares

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//!Routers
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/user', require('./routes/userRouter'));
app.use('/api/admin', require('./routes/authAdminRouter'));

app.use('/api/music', require('./routes/music/musicRouter'));
app.use('/api/chatBox', require('./routes/chatBox/chatBoxRouter'));

app.use('/api/comment', require('./routes/comment/commentRouter'));
app.use('/api/lyrics', require('./routes/lyrics/lyricsRouter'));
app.use('/api/event', require('./routes/event/evenement'));
app.use('/api/playlist', require('./routes/playlist/playlistRouter'));

app.use('/api/reclamation', require('./routes/reclamation/reclamationRouter'));
app.use('/api/reclamationAdmin', require('./routes/reclamation/reclamationAdminRouter'));

app.use('/api/event', require('./routes/event/evenement'));
// Marketplace Routes

app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);

//   karaoké+Course
app.use("/api/Karaoke", karaokeRoute);
app.use("/api/course", courseRoute);

var configDB = require('./database/mongodb.json');

//!Database connection to mongoose

//mongo config
const connect = mongoose.connect(

   // process.env.MONGO_URL,
   configDB.mongo.uri,

  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    findOneAndUpdate: true
  },
  () => console.log('Connected to DB !!'));

//!listening on port

//const port = process.env.PORT || 8080;
server.listen(process.env.PORT || 5000, () => {
    console.log("Backend server is running!");
});
