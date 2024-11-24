import { IChatMessage } from '../common/chatMessage.interface';
import { io, Socket } from 'socket.io-client';
import axios, { AxiosResponse } from 'axios';
import { IResponse } from '../common/server.responses';
import { IUser } from '../common/user.interface';
import { on } from 'events';
import { ServerToClientEvents, ClientToServerEvents } from '../common/socket.interface';
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

socket.on('connect', () => {
  console.log(`⚡️[Client]: Connected to the socket server with id ${socket.id}`);
});

// 发送 ping 测试事件，验证客户端和服务器之间的连接
socket.emit('ping');

function onLogout(e: Event): void {
  e.preventDefault();
  // TODO: logout button event handler
  // logout by deleting locally stored token and current user
  // 清除本地存储中的 token
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  // 重定向到登录页面
  window.location.href = '/auth';
}

async function postChatMessage(chatMsg: IChatMessage): Promise<void> {
  // TODO: save chat message on the server
  try {
    const response = await axios.post('../chat/messages', chatMsg, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    if (error.response && error.response.data.name === 'MissingChatText') {
      alert(error.response.data.message); // 在 catch 中展示 alert
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

//
function onPost(e: Event): void {
  // TODO: post button event handler
  e.preventDefault();
  const chatInput = document.getElementById('chat-input') as HTMLInputElement;
  const text = chatInput.value.trim();
  if (username) {
    const chatMsg: IChatMessage = {
      author: username,
      text: text,
      timestamp: new Date().toISOString()
    };
    postChatMessage(chatMsg);
    chatInput.value = ''; // 清空输入框
  } else {
    console.error('No username found');
  }
}

function makeChatMessage(
  author: string,
  timestamp: string,
  text: string,
  displayname: string
): HTMLElement {
  // TODO: create an HTML element that contains a chat message
  const messageElement = document.createElement('div');
  const messageClass = author === username ? 'chat-message user-message' : 'chat-message';
  messageElement.innerHTML = `
    <div class="message-list">
      <div class="timestamp">${new Date(timestamp).toLocaleString()}</div>
      <div class="${messageClass}">
        <div class="user-name"><strong>${displayname}:</strong></div>
        <div class="user-message">${text}</div>
      </div>
    </div>
  `;
  return messageElement;
}

function onNewChatMessage(chatMsg: IChatMessage): void {
  // TODO: eventhandler for websocket new-chat-message event
  // used to update chat message list
  const chatWindow = document.getElementById('chat-window') as HTMLElement;
  console.log('New chat message:', chatMsg);
  if (chatMsg.author && chatMsg.timestamp && chatMsg.text) {
    const messageElement = makeChatMessage(
      chatMsg.author,
      chatMsg.timestamp,
      chatMsg.text,
      chatMsg.displayName || 'Anon'
    );
    // 使用 appendChild 正确地添加元素
    chatWindow.appendChild(messageElement);

    // 滚动到底部
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } else {
    console.error('Invalid chat message:', chatMsg);
  }
  chatWindow.scrollTo(0, chatWindow.scrollHeight);
}

async function getChatMessages(): Promise<void> {
  // TODO: get all chat messages from the server and...
  // ... add them to the chat room page
  try {
    const response = await axios.get('../chat/messages', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const messages = response.data.payload;
    const chatWindow = document.getElementById('chat-window') as HTMLElement;

    messages.forEach((msg) => {
      const messageElement = makeChatMessage(msg.author, msg.timestamp, msg.text, msg.displayName);
      chatWindow.appendChild(messageElement);
    });
    chatWindow.scrollTo(0, chatWindow.scrollHeight);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
  }
}

async function isLoggedIn(): Promise<boolean> {
  // TODO: determine whether the user is logged in
  return !!token;
}

document.addEventListener('DOMContentLoaded', async function (e: Event) {
  // Document-ready event handler
  e.preventDefault();
  // anything to TODO here?
  if (await isLoggedIn()) {
    await getChatMessages();

    // 监听来自服务器的 newChatMessage 事件，实时更新消息
    socket.on('newChatMessage', (chatMsg: IChatMessage) => {
      onNewChatMessage(chatMsg);
    });
  }
  document.getElementById('logout-button')?.addEventListener('click', onLogout);
  document.getElementById('chat-form')?.addEventListener('submit', onPost);
});
