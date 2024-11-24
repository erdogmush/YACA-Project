// This is the model for users
// It is used by the controllers to access functionality related users, including database access

import { ILogin, IUser } from '../../common/user.interface';
import DAC from '../db/dac';
import { IAppError } from '../../common/server.responses';
import bcrypt from 'bcrypt';

export class User implements IUser {
  credentials: ILogin;

  extra?: string; // this carries the displayName of the user

  constructor(credentials: ILogin, extra?: string) {
    this.credentials = credentials;
    // TODO
    this.extra = extra;
  }

  async join(): Promise<IUser> {
    // join YACA as a user, serving the register request
    // TODO
    try {
      const hashedPassword = await bcrypt.hash(this.credentials.password, 10);
      this.credentials.password = hashedPassword;

      // 将用户保存到MongoDB
      const savedUser = await DAC._db.saveUser(this);
      return {
        credentials: { username: savedUser.credentials.username, password: '*******' },
        extra: savedUser.extra,
        _id: savedUser._id // 返回生成的 _id
      };
    } catch (error) {
      throw new Error('Error saving user: ' + (error as Error).message);
    }
  }

  async login(): Promise<IUser> {
    // login to  YACA with user credentials
    // TODO
    try {
      // 查找用户
      const user = await DAC._db.findUserByUsername(this.credentials.username);
      if (!user) throw new Error('User not found');

      // 验证密码
      const match = await bcrypt.compare(this.credentials.password, user.credentials.password);
      if (!match) {
        throw new Error('Invalid password');
      }

      // 返回用户信息，密码字段模糊化
      return {
        ...user,
        credentials: { ...user.credentials, password: '*******' }
      };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  static async getAllUsernames(): Promise<string[]> {
    // get the usernames of all users
    // TODO
    try {
      const users = await DAC._db.findAllUsers();
      return users.map((user) => user.credentials.username);
    } catch (error) {
      throw new Error('Error fetching all usernames: ' + (error as Error).message);
    }
  }

  static async getUserForUsername(username: string): Promise<IUser | null> {
    // get the user having a given username
    // TODO
    try {
      const user = await DAC._db.findUserByUsername(username);
      return user;
    } catch (error) {
      throw new Error('Error fetching user by username: ' + (error as Error).message);
    }
  }
}
