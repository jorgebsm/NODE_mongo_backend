import { Response, Router } from "express";
import FileSystem from "../classes/file-system";
import { FileUpload } from "../interfaces/file-upload";
import { verificaToken } from "../middlewares/autenticacion";
import { Post } from "../models/post.model";


const postRoutes = Router();
const fileSystem = new FileSystem();

//obtener post paginado
postRoutes.get('/', async (req: any, res: Response) => {

    let page = Number(req.query.page) || 1;
    let skip = page - 1;
    skip = skip * 10;
    
    const posts = await Post.find()
                            .sort({ _id: -1 })
                            .skip( skip )
                            .limit(10)
                            .populate('usuario', '-password')
                            .exec();

    res.json({
        ok: true,
        page,
        posts
    });

});


//Crear post
postRoutes.post('/', [ verificaToken ], (req: any, res: Response) => {

    const body = req.body;
    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesDeTempHaciaPost( req.usuario._id );
    body.imgs = imagenes;

    Post.create( body ).then( async (postDB : any) => {
      
        //importante: pondremos toda la info del usuario acá

        await postDB.populate('usuario', '-password');

        res.json({
            ok: true,
            postDB
        });

    }).catch(
        err => {
            res.json(err);
        }
    );

});

// Servicio para subir archivos
postRoutes.post('/upload', [ verificaToken ], async (req: any, res: Response) => {
    
    if ( !req.files ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió ningún archivo'
        });
    }

    const file: FileUpload = req.files.image;

    if ( !file ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió ningún archivo -image'
        });
    }

    if ( !file.mimetype.includes('image') ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe subir una imagen'
        });
    }

    await fileSystem.guardarImagenTemporal( file, req.usuario._id );

    return res.json({
        ok: true,
        file: file.mimetype
    });

});


postRoutes.get('/imagen/:userId/:img', ( req: any, res: Response ) => {

    const userId = req.params.userId;
    const img = req.params.img;

    const pathPhoto = fileSystem.getPhotoUrl( userId, img );

    res.sendFile( pathPhoto );

});


export default postRoutes;