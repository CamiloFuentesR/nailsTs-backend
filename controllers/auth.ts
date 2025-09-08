import { Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcrypt';
import generateJWT from '../helpers/generateJWT';
import { Role, User, UserInstance } from '../models';
import googleVerify from '../helpers/google-verify';
// import { firebaseAdminAuth } from '../firebase/firebase-admin';
// import { firebaseAdminAuth } from '../config/firebase-admin';

export const login: RequestHandler = async (req: Request, res: Response) => {
  let { password, email } = req.body;

  try {
    const user: UserInstance | null = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['name'] }],
    });
    if (!user) {
      return res.status(400).json({
        msg: 'Usuario o contraseña incorrectos',
      });
    }
    if (!user.state) {
      return res.status(400).json({
        msg: 'Usuario inhabilitado',
      });
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      return res.status(400).json({
        msg: 'Usuario o contraseña incorrecto',
      });
    }
    const { id } = user;
    const roleName = user.dataValues.Role?.name || 'unknown';
    const token = await generateJWT(id, email, roleName);
    res.json({
      ok: true,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
  }
};

export const renewToken: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id, email } = req.user;
  const role = req.role;

  // Generar un nuevo token después de revalidar el token anterior
  const token = await generateJWT(id, email, role);
  res.status(201).json({
    ok: true,
    token,
  });
};

export const googleSignIn: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id_token } = req.body;
  console.log('id_token');
  console.log(id_token);
  try {
    const googleUser = await googleVerify(id_token);

    if (googleUser) {
      const { email, name, picture } = googleUser;

      if (!email) {
        return res.status(400).json({
          ok: false,
          msg: 'Email no proporcionado por Google',
        });
      }

      let user = await User.findOne({
        where: { email, state: true },
        include: [{ model: Role, attributes: ['name'] }],
      });

      if (!user) {
        user = await User.create({
          email,
          password: ':p',
          role_id: 3,
          state: true,
        });
        const roleName = user.dataValues.Role?.name || 'INVITE_ROLE';
        const token = await generateJWT(user.id, email, roleName);
        return res.status(201).json({
          ok: true,
          msg: 'Usuario creado con éxito',
          token,
        });
      }

      if (!user.state) {
        return res.status(401).json({
          msg: 'Usuario inhabilitado',
        });
      }
      const roleName = user.dataValues.Role?.name || 'unknown';
      const token = await generateJWT(user.id, email, roleName);
      return res.status(201).json({
        ok: true,
        token,
      });
    }

    return res.status(400).json({
      ok: false,
      msg: 'No se pudo obtener el Token',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'El Token no se pudo verificar',
      error,
    });
  }
};
export const googleSignInFirebase: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body;
  try {
    // const firebaseGoogleUser = await firebaseAdminAuth.verifyIdToken(id_token);
    // console.log('firebaseGoogleUser');
    // console.log(firebaseGoogleUser);
    if (email) {
      //   const { email, name, picture } = firebaseGoogleUser;

      if (!email) {
        return res.status(400).json({
          ok: false,
          msg: 'Email no proporcionado por Google',
        });
      }

      let user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ['name'] }],
      });

      if (!user) {
        user = await User.create({
          email,
          password: ':p',
          role_id: 3,
          state: true,
        });
        const roleName = user.dataValues.Role?.name || 'INVITE_ROLE';
        const token = await generateJWT(user.id, email, roleName);
        return res.status(201).json({
          ok: true,
          msg: 'Usuario creado con éxito',
          token,
        });
      }

      if (!user.state) {
        return res.status(401).json({
          msg: 'Usuario inhabilitado',
        });
      }
      const roleName = user.dataValues.Role?.name || 'unknown';
      const token = await generateJWT(user.id, email, roleName);
      return res.status(201).json({
        ok: true,
        token,
      });
    }
    return res.status(400).json({
      ok: false,
      msg: 'No se pudo obtener el Token de firebase',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'El Token no se pudo verificar',
      error,
    });
  }
};
