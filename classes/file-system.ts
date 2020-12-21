import { FileUpload } from "../interfaces/file-upload";
import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';

export default class FileSystem {

    constructor() {}

    guardarImagenTemporal( file: FileUpload, userId: string ) {

        return new Promise( (resolve: any, reject) => {

            //Crear carpetas
            const path = this.crearCarpetaUsuario( userId );

            //Nombre de archivo
            const nombreArchivo = this.generarNombreUnico( file.name );        

            //Mover el archivo del temp a nuestra carpeta
            file.mv( `${path}/${nombreArchivo}`, (err: any) => {
                
                if ( err ) {
                    reject(err);
                } else {
                    resolve();
                }

            });

        })

    }

    private generarNombreUnico( nameOriginal: string ) {

        const nombreArr = nameOriginal.split('.');
        const extension = nombreArr[ nombreArr.length -1 ];
        const idUnico = uniqid();

        return `${idUnico}.${extension}`;

    }

    private crearCarpetaUsuario( userId: string ) {

        const pathUser = path.resolve( __dirname, '../uploads/', userId );
        const pathUserTemp = pathUser + '/temp';
        const existe = fs.existsSync( pathUser );

        if ( !existe ) {
            fs.mkdirSync( pathUser );
            fs.mkdirSync( pathUserTemp );
        }

        return pathUserTemp;

    }

    public imagenesDeTempHaciaPost( userId: string ) {

        const pathTemp = path.resolve( __dirname, '../uploads/', userId, 'temp' );
        const pahtPost = path.resolve( __dirname, '../uploads/', userId, 'posts' );
    
        if ( !fs.existsSync( pathTemp ) ) {
            return [];
        }

        if ( !fs.existsSync( pahtPost ) ) {
            fs.mkdirSync( pahtPost );
        }

        const imagenesTemp = this.obtenerImagenesEnTemp( userId );

        imagenesTemp.forEach( imagen => {
            fs.renameSync( `${ pathTemp }/${ imagen }`, `${ pahtPost }/${ imagen }` )
        });

        return imagenesTemp;

    }

    private obtenerImagenesEnTemp( userId: string ) {
        const pathTemp = path.resolve( __dirname, '../uploads/', userId, 'temp' );
        return fs.readdirSync( pathTemp ) || [];
    }

    getPhotoUrl( userId: string, img: string ) {
        
        // path posts
        const pathPhoto = path.resolve( __dirname, '../uploads', userId, 'posts', img);
        
        //si no existe
        const existe = fs.existsSync( pathPhoto );
        if ( !existe ) {
            return path.resolve( __dirname, '../assets/400x250.jpg' );
        }

        return pathPhoto;
    }
    
}