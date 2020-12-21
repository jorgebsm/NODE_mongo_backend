import Server from "./classes/server";
import userRoutes from "./routes/usuario";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import postRoutes from "./routes/post";
import fileUpload from 'express-fileupload';

const server = new Server;

//middleware body parser
server.app.use( bodyParser.urlencoded({ extended: true }) );
server.app.use( bodyParser.json() );

// FileUpload
server.app.use( fileUpload() );

//rutas de mi app
server.app.use('/user', userRoutes);
server.app.use('/post', postRoutes);

//conectar bd
mongoose.connect('mongodb://localhost:27017/vlupp',
{
    useNewUrlParser: true, useCreateIndex: true
},
err => {
    if ( err ) throw err;
    console.log("Base de datos online");
    
});

//levantar express
server.start(() => {
    console.log(`Servidor corriendo en el puerto ${ server.port }`);
});