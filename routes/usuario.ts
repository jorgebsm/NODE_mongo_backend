import { Request, Response, Router } from "express";
import { Usuario } from "../models/usuario.model";
import bcrypt from "bcrypt";
import Token from "../classes/token";
import { verificaToken } from "../middlewares/autenticacion";

const userRoutes = Router();

userRoutes.post('/login', ( req: Request, res: Response ) => {
    
    const body = req.body;

    Usuario.findOne({ email: body.email }, ( err, userDB ) => {
        
        if (err) throw err;

        if ( !userDB ) {
            return res.json({
                ok: false,
                mensaje: 'Usuario o contraseña incorrecta'
            });
        }

        if ( userDB.comparePassword( body.password ) ) {
            const tokenUser = Token.getJwtToken({
                _id: userDB.id,
                nombre: userDB.name,
                email: userDB.email,
                avatar: userDB.avatar
            });
            res.json({
                ok: true,
                token: tokenUser
            });
        } else {
            return res.json({
                ok: false,
                mensaje: 'Usuario o contraseña incorrecta'
            });
        }
        
    })
    
});

userRoutes.post('/create', ( req: Request, res: Response ) => {

    const user = {
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        avatar: req.body.avatar
    };

    Usuario.create( user ).then( userDB => {
        
        const tokenUser = Token.getJwtToken({
            _id: userDB.id,
            nombre: userDB.name,
            email: userDB.email,
            avatar: userDB.avatar
        });

        res.json({
            ok: true,
            token: tokenUser
        });

    }).catch(
        err => {
            res.json({
                ok: false,
                err
            });
        }
    );

});

userRoutes.post('/update', verificaToken, ( req: any, res: Response ) => {

    const user = {
        name: req.body.name || req.usuario.name,
        email: req.body.email || req.usuario.email,
        avatar: req.body.avatar || req.usuario.avatar
    }

    Usuario.findByIdAndUpdate( req.usuario._id, user, { new: true }, ( err, userDB ) => {
        
        if ( err ) throw err;

        if ( !userDB ) {
            return res.json({
                ok: false,
                mensaje: 'No existe un usuario con es ese ID'
            });
        }

        const tokenUser = Token.getJwtToken({
            _id: userDB.id,
            nombre: userDB.name,
            email: userDB.email,
            avatar: userDB.avatar
        });

        res.json({
            ok: true,
            token: tokenUser 
        });

    });

});

userRoutes.get('/', [verificaToken], ( req: any, res: Response ) => {

    const usuario = req.usuario;

    res.json({
        ok: true,
        usuario
    });

})

export default userRoutes;