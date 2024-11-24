// an InMemory version of the database that you can use in early-stage development
// It's not persistent, but can be used for testing and debugging
// It allows you to evolve your application in the absense of a real database

import { IDatabase } from './dac';
import { IChatMessage } from '../../common/chatMessage.interface';
import { IUser } from '../../common/user.interface';
import { IAppError } from '../../common/server.responses';

export class InMemoryDB implements IDatabase {
  // TODO
  private users: IUser[] = []; // 用于存储用户的数组
  private chatMessages: IChatMessage[] = []; // 用于存储聊天消息的数组

  async connect(): Promise<void> {
    // TODO
  }

  async init(): Promise<void> {
    // TODO
    this.users = [];
    this.chatMessages = [];
    console.log('Database initialized');
  }

  async close(): Promise<void> {
    // TODO
  }

  async saveUser(user: IUser): Promise<IUser> {
    // TODO: must return a copy of the saved user
    const newUser: IUser = structuredClone(user);
    this.users.push(newUser);

    return structuredClone(newUser);
  }

  async findUserByUsername(username: string): Promise<IUser | null> {
    // TODO
    const user = this.users.find((u) => u.credentials.username === username);
    return user || null; // 找到用户返回用户，找不到返回null
  }

  async findAllUsers(): Promise<IUser[]> {
    // TODO
    return this.users.map((user) => ({ ...user }));
  }

  async saveChatMessage(message: IChatMessage): Promise<IChatMessage> {
    // TODO: must return a copy of the saved message
    this.chatMessages.push({ ...message });
    return { ...message }; // 返回保存的消息副本
  }

  async findChatMessageById(_id: string): Promise<IChatMessage | null> {
    // TODO
    return null;
  }

  async findAllChatMessages(): Promise<IChatMessage[]> {
    // TODO
    return this.chatMessages.map((message) => ({ ...message }));
  }
}
