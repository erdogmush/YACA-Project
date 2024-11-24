// This is the model for chat messages
// It is used by the controllers to access functionality related chat messages, including database access

import DAC from '../db/dac';
import { IChatMessage } from '../../common/chatMessage.interface';
import { IUser } from '../../common/user.interface';
import { IAppError } from '../../common/server.responses';
import { User } from './user.model';

export class ChatMessage implements IChatMessage {
  public timestamp: string;
  public displayName: string;

  constructor(
    public author: string,
    public text: string,
    displayName: string
  ) {
    // TODO
    this.displayName = displayName;
    this.timestamp = new Date().toISOString(); // 分配当前时间戳
  }

  async post(): Promise<IChatMessage> {
    // TODO
    // 使用 MongoDB 保存消息
    try {
      const savedMessage = await DAC._db.saveChatMessage(this);
      return savedMessage;
    } catch (error) {
      throw new Error('Error saving chat message: ' + (error as Error).message);
    }
  }

  static async getAllChatMessages(): Promise<IChatMessage[]> {
    // TODO
    // 调用数据库中的方法获取所有消息
    try {
      return await DAC._db.findAllChatMessages();
    } catch (error) {
      throw new Error('Error fetching all chat messages: ' + (error as Error).message);
    }
  }

  // TODO
}
