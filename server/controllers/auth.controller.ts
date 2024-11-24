// Controller serving the athentication page and handling user registration and login
// Note that controllers don't access the DB direcly, only through the models

import { ILogin, IUser } from '../../common/user.interface';
import { User } from '../models/user.model';
import Controller from './controller';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as responses from '../../common/server.responses';
import { JWT_KEY, JWT_EXP } from '../env';

export default class AuthController extends Controller {
  public constructor(path: string) {
    super(path);
  }

  public initializeRoutes(): void {
    // this should define the routes handled by the middlewares authPage, register, and login
    // TODO
    this.router.get('/', this.authPage);
    this.router.post('/users', this.register); // 处理用户注册
    this.router.post('/tokens/:username', this.login); // 处理用户登录
  }

  public async authPage(req: Request, res: Response) {
    res.redirect('/pages/auth.html');
  }

  public async register(req: Request, res: Response) {
    // TODO
    try {
      const { username, password } = req.body.credentials;
      const extra = req.body.extra;

      // 检查是否已经存在同样的用户
      const existingUser = await User.getUserForUsername(username);
      if (existingUser) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'UserExists' as responses.ClientErrorName,
          message: 'User already exists'
        };
        return res.status(400).json(error);
      }

      if (!username) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'MissingUsername' as responses.ClientErrorName,
          message: 'Missing username'
        };
        return res.status(400).json(error);
      }

      if (!password) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'MissingPassword' as responses.ClientErrorName,
          message: 'Missing password'
        };
        return res.status(400).json(error);
      }

      if (!extra) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'MissingDisplayName' as responses.ClientErrorName,
          message: 'Missing display name'
        };
        return res.status(400).json(error);
      }

      // 验证密码强度
      const passwordValidation = AuthController.validatePassword(password);
      // console.log(passwordValidation);
      if (!passwordValidation.valid) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'WeakPassword' as responses.ClientErrorName,
          message: passwordValidation.message || 'Password is invalid'
        };
        return res.status(400).json(error);
      }

      // 创建新用户并保存到数据库
      const newUser = new User({ username, password }, extra);
      const savedUser = await newUser.join();

      // 成功返回用户信息
      const successResponse: responses.ISuccess = {
        name: 'UserRegistered',
        message: 'User successfully registered',
        authorizedUser: username,
        payload: savedUser
      };
      res.status(201).json(successResponse);
    } catch (error) {
      throw new Error(`Register error: ${(error as Error).message}`);
    }
  }

  public async login(req: Request, res: Response) {
    // TODO
    try {
      console.log('Request body:', req.body);
      const { username } = req.params;
      const { password } = req.body;
      // console.log(username);
      // console.log(password);

      // 创建 User 实例并调用 login 方法进行验证
      const userInstance = new User({ username, password });
      const userInfo = await userInstance.login();

      console.log(JWT_EXP);
      // 生成 JWT 并返回用户信息和 token
      const token = jwt.sign({ username }, JWT_KEY, { expiresIn: JWT_EXP });
      const successResponse: responses.ISuccess = {
        name: 'UserAuthenticated',
        message: 'User successfully authenticated',
        authorizedUser: username,
        payload: {
          token,
          user: userInfo
        }
      };
      res.status(200).json(successResponse);
    } catch (error) {
      if ((error as Error).message === 'User not found') {
        const errorResponse: responses.IAppError = {
          type: 'ClientError',
          name: 'UnregisteredUser' as responses.ClientErrorName,
          message: 'User not found'
        };
        return res.status(400).json(errorResponse);
      }

      if ((error as Error).message === 'Invalid password') {
        const errorResponse: responses.IAppError = {
          type: 'ClientError',
          name: 'IncorrectPassword' as responses.ClientErrorName,
          message: 'Incorrect password'
        };
        return res.status(400).json(errorResponse);
      }
      throw new Error(`Login failed: ${(error as Error).message}`);
    }
  }

  private static validatePassword(password: string): { valid: boolean; message?: string } {
    // 检查长度
    if (password.length < 4) {
      return { valid: false, message: 'Password must be at least 4 characters long.' };
    }

    // 检查是否包含字母
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one letter character.' };
    }

    // 检查是否包含数字
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number character.' };
    }

    // 检查是否包含特殊字符
    const specialCharacters = /[$%#@!*&~^+-]/;
    if (!specialCharacters.test(password)) {
      return {
        valid: false,
        message:
          'Password must contain at least one special character from the set: { $ % # @ ! * & ~ ^ - + }'
      };
    }

    // 检查是否包含无效字符
    const validCharacters = /^[a-zA-Z0-9$%#@!*&~^+-]+$/;
    if (!validCharacters.test(password)) {
      return {
        valid: false,
        message:
          'Password can only contain letters, numbers, and special characters { $ % # @ ! * & ~ ^ - + }'
      };
    }

    return { valid: true };
  }
}
