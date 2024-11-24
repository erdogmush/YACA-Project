// Controller serving the chat room page and handling the loading, posting, and update of chat messages
// Note that controllers don't access the DB direcly, only through the models

import Controller from './controller';
import { ILogin, IUser } from '../../common/user.interface';
import { User } from '../models/user.model';
import { ChatMessage } from '../models/chatMessage.model';
import { IChatMessage } from '../../common/chatMessage.interface';
import { NextFunction, Request, Response } from 'express';

// Extend the Request interface to include decodedUsername
declare module 'express-serve-static-core' {
  interface Request {
    decodedUsername?: string;
  }
}
import * as responses from '../../common/server.responses';
import jwt from 'jsonwebtoken';
import { JWT_KEY } from '../env';

export default class ChatController extends Controller {
  public constructor(path: string) {
    super(path);
  }

  public initializeRoutes(): void {
    // this should define the routes handled by the middlewares chatRoomPage,
    // authenticate, getAllUsers, getUser, postMessage, and getAllMessages
    // TODO
    this.router.get('/', this.chatRoomPage);
    this.router.post('/messages', this.authorize, this.postMessage); // 定义发布消息的路由
    this.router.get('/messages', this.authorize, this.getAllMessages); // 定义获取所有消息的路由
    this.router.get('/usernames', this.authorize, this.getAllUsers); // 获取所有用户
    this.router.get('/users/:username', this.authorize, this.getUser); // 获取单个用户信息
  }

  public chatRoomPage(req: Request, res: Response) {
    res.redirect('/pages/chat.html');
  }

  public authorize(req: Request, res: Response, next: NextFunction) {
    // TODO - check if the user is logged in by validating token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.redirect('/auth');
      const error: responses.IAppError = {
        type: 'ClientError',
        name: 'MissingToken' as responses.ClientErrorName,
        message: 'Authorization token is missing'
      };
      return res.status(401).json(error);
    }

    try {
      // 验证 token 并解码，只提取 username
      const decoded = jwt.verify(token, JWT_KEY) as {
        username: string;
        iat: number;
        exp: number;
      };
      const username = decoded.username;
      req.decodedUsername = decoded.username;

      // 使用解码后的 username 获取完整的用户信息
      const user = User.getUserForUsername(username);

      if (!user) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'OrphanedChatMessage' as responses.ClientErrorName,
          message: 'User not found. This is an orphaned chat message.'
        };
        return res.status(404).json(error);
      }

      next();
    } catch (err) {
      const error: responses.IAppError = {
        type: 'ClientError',
        name: 'InvalidToken' as responses.ClientErrorName,
        message: 'Invalid or expired token'
      };
      return res.status(401).json(error);
    }
  }

  public async getAllUsers(req: Request, res: Response) {
    // TODO
    try {
      const users = await User.getAllUsernames();
      const usernames = users.map((user) => user); // 返回所有用户名
      const successResponse: responses.ISuccess = {
        name: 'UsersFound',
        message: 'Successfully fetched all usernames',
        payload: usernames
      };
      res.status(200).json(successResponse);
    } catch (err) {
      const error: responses.IAppError = {
        type: 'ClientError',
        name: 'InvalidToken' as responses.ClientErrorName,
        message: 'Invalid or expired token'
      };
      return res.status(401).json(error);
    }
  }

  public async getUser(req: Request, res: Response) {
    // TODO
    try {
      const username = req.params.username;
      const user = await User.getUserForUsername(username);

      if (!user) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'UserNotFound' as responses.ClientErrorName,
          message: 'The requested user does not exist'
        };
        return res.status(400).json(error);
      }

      const successResponse: responses.ISuccess = {
        name: 'UserFound',
        message: 'Successfully find user',
        payload: user
      };
      res.status(200).json(successResponse);
    } catch (error) {
      throw new Error(`Get user error: ${(error as Error).message}`);
    }
  }

  public async postMessage(req: Request, res: Response) {
    // TODO
    try {
      const author = req.body.author;
      const text = req.body.text;
      const decodedUsername = req.decodedUsername;

      if (!author) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'MissingAuthor' as responses.ClientErrorName,
          message: 'Chat message author cannot be empty. Please re-enter the chat message author'
        };
        return res.status(400).json(error);
      }

      // 检查 text 字段是否存在且非空
      if (!text || text.trim() === '') {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'MissingChatText' as responses.ClientErrorName,
          message: 'Chat message text cannot be empty. Please re-enter the chat message text'
        };
        return res.status(400).json(error);
      }

      // 检查 author 是否与 token 中的 username 匹配
      if (decodedUsername !== author) {
        const error: responses.IAppError = {
          type: 'ClientError',
          name: 'UnauthorizedRequest' as responses.ClientErrorName,
          message: 'You are not allowed to post messages on behalf of another user.'
        };
        return res.status(401).json(error);
      }

      const user = await User.getUserForUsername(author);
      const displayName = user ? user.extra : 'Anonymous';
      // 创建并保存消息
      const message = new ChatMessage(author!, text!, displayName!);
      const savedMessage = await message.post();

      const responsePayload: IChatMessage = {
        _id: savedMessage._id,
        author: savedMessage.author,
        text: savedMessage.text,
        displayName: displayName,
        timestamp: savedMessage.timestamp
      };

      // 使用 Controller.io 进行消息广播
      Controller.io.emit('newChatMessage', responsePayload);

      const successResponse: responses.ISuccess = {
        name: 'ChatMessageCreated',
        message: 'User successfully posted a message',
        authorizedUser: decodedUsername, // 返回 token 中的 username
        payload: responsePayload
      };
      res.status(201).json(successResponse);
    } catch (error) {
      throw new Error(`Post message error: ${(error as Error).message}`);
    }
  }

  public async getAllMessages(req: Request, res: Response) {
    // TODO
    try {
      // 从 ChatMessage 模型获取所有消息
      const messages = await ChatMessage.getAllChatMessages();
      const decodedUsername = req.decodedUsername;

      const successResponse: responses.ISuccess = {
        name: messages.length === 0 ? 'NoChatMessagesYet' : 'ChatMessagesFound',
        message:
          messages.length === 0
            ? 'No chat messages found'
            : 'Successfully pulled all chat messages',
        authorizedUser: decodedUsername,
        payload: messages
      };
      res.status(200).json(successResponse);
    } catch (error) {
      throw new Error(`Get all message error: ${(error as Error).message}`);
    }
  }
}
