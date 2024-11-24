// This is the real database, using MongoDB and Mongoose
// It can be initialized with a MongoDB URL pointing to a production or development/test database

import { IDatabase } from './dac';
import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';
import { IUser } from '../../common/user.interface';
import { IChatMessage } from '../../common/chatMessage.interface';
import { IAppError } from '../../common/server.responses';

const UserSchema = new Schema<IUser>({
  // TODO
  credentials: {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  extra: { type: String } // stores the user's display name provided in a request
});

const ChatMessageSchema = new Schema<IChatMessage>({
  // TODO
  author: { type: String, required: true }, // author's username, contains the email provided by the user
  text: { type: String, required: true }, // contents of the chat message
  displayName: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const MUser = model<IUser>('User', UserSchema);

const MChatMessage = model<IChatMessage>('Message', ChatMessageSchema);

export class MongoDB implements IDatabase {
  public dbURL: string;

  private db: mongoose.Connection | undefined;

  constructor(dbURL: string) {
    this.dbURL = dbURL;
  }

  async connect(): Promise<void> {
    // TODO
    if (this.db) {
      return;
    }
    try {
      await mongoose.connect(this.dbURL);
      this.db = mongoose.connection;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async init(): Promise<void> {
    // TODO
    // MongoDB doesn't need explicit initialization like in-memory DB
    console.log('MongoDB initialized');
  }

  async close(): Promise<void> {
    // TODO
    if (this.db) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }

  async saveUser(user: IUser): Promise<IUser> {
    // TODO
    try {
      const newUser = new MUser(user);
      const savedUser = await newUser.save();
      return savedUser.toObject();
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async findUserByUsername(username: string): Promise<IUser | null> {
    // TODO
    try {
      const user = await MUser.findOne({ 'credentials.username': username }).exec();
      return user ? user.toObject() : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  async findAllUsers(): Promise<IUser[]> {
    // TODO
    try {
      const users = await MUser.find().exec();
      return users.map((user) => user.toObject());
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  async saveChatMessage(message: IChatMessage): Promise<IChatMessage> {
    // TODO
    try {
      const newMessage = new MChatMessage(message);
      const savedMessage = await newMessage.save();
      return savedMessage.toObject();
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async findAllChatMessages(): Promise<IChatMessage[]> {
    // TODO
    try {
      const messages = await MChatMessage.find().exec();
      return messages.map((message) => message.toObject());
    } catch (error) {
      console.error('Error finding all chat messages:', error);
      throw error;
    }
  }

  async findChatMessageById(_id: string): Promise<IChatMessage | null> {
    // TODO
    try {
      const message = await MChatMessage.findById(_id).exec();
      return message ? message.toObject() : null;
    } catch (error) {
      console.error('Error finding chat message by ID:', error);
      throw error;
    }
  }
}
