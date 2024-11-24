import { v4 as uuidV4 } from 'uuid';

import { IFriend } from '../common/friend.interface';

let friends: IFriend[] = JSON.parse(localStorage.getItem('friendList') || '[]');

// 初始化时加载好友列表
function displayFriends() {
  const friendListDiv = document.getElementById('friend-list')!;
  const clearListButton = document.getElementById('clear-list-btn')!;
  friendListDiv.innerHTML = '';

  // 如果没有好友，隐藏 "Clear List" 按钮；否则显示
  if (friends.length === 0) {
    clearListButton.style.display = 'none';
  } else {
    clearListButton.style.display = 'block';
  }

  // 渲染好友列表
  friends.forEach((friend) => {
    const friendElement = createFriendElement(friend);
    friendListDiv.appendChild(friendElement);
  });
}

// 创建单个好友的 DOM 元素
function createFriendElement(friend: IFriend): HTMLElement {
  const friendItem = document.createElement('div');
  friendItem.classList.add('friend-item');
  friendItem.setAttribute('data-id', friend.id);

  friendItem.innerHTML = `
    <div class="checkbox-name-container">
      <input type="checkbox" ${friend.invited ? 'checked' : ''}>
    </div>
    <div class="name-and-email">
      <label class="friend-info">${friend.displayName}</label>
      <p>${friend.email}</p>
    </div>
    <button class="remove-friend" data-id="${friend.id}">&times;</button>
  `;

  // 监听复选框的变化
  friendItem
    .querySelector('input[type="checkbox"]')!
    .addEventListener('change', function () {
      if (this.checked && !friend.invited) {
        // 如果该好友未被邀请，发送邀请邮件
        inviteFriend(friend);
      } else if (!this.checked && friend.invited) {
        // 如果该好友已被邀请但用户取消勾选，弹出提示
        alert(
          'You may have already invited this friend! After unchecking this checkbox, you can re-invite this friend by rechecking it.'
        );
        // 允许用户再次勾选重新发送邀请
        friend.invited = false;
        saveFriends();
      }
    });

  // 添加删除按钮的监听器
  friendItem
    .querySelector('.remove-friend')!
    .addEventListener('click', function () {
      if (confirm('Are you sure you want to delete this Friend?')) {
        removeFriend(friend.id);
      }
    });

  return friendItem;
}

// 发送邀请邮件功能
function inviteFriend(friend: IFriend) {
  const subject = encodeURIComponent('I am inviting you to YACA');
  const body = encodeURIComponent(
    'Please visit http://yaca-myandrewid.onrender.com to register and invite your own Friends.'
  );
  const mailtoLink = `mailto:${friend.email}?subject=${subject}&body=${body}`;

  // 打开邮件客户端
  window.location.href = mailtoLink;

  // 标记好友为已邀请
  friend.invited = true;
  saveFriends();
}

// 保存好友列表到 localStorage
function saveFriends() {
  localStorage.setItem('friendList', JSON.stringify(friends));
}

// 添加新好友
function addFriend() {
  const friendNameInput = <HTMLInputElement>(
    document.getElementById('friend-name')
  );
  const friendEmailInput = <HTMLInputElement>(
    document.getElementById('friend-email')
  );

  const friendName = friendNameInput.value.trim();
  const friendEmail = friendEmailInput.value.trim();

  if (!friendName || !friendEmail) {
    alert('Please provide both name and email.');
    return;
  }

  if (!friendEmailInput.checkValidity()) {
    alert('Please provide a valid email address.');
    return;
  }

  if (
    friends.some((f) => f.email.toLowerCase() === friendEmail.toLowerCase())
  ) {
    alert('Friend with this email already exists.');
    friendEmailInput.value = '';
    return;
  }

  const newFriend: IFriend = {
    id: uuidV4(), // 使用 uuid 生成唯一的id
    displayName: friendName,
    email: friendEmail,
    invited: false
  };

  friends.push(newFriend);
  saveFriends();

  // 只添加新好友元素，而不是重新渲染整个列表
  const friendListDiv = document.getElementById('friend-list')!;
  const newFriendElement = createFriendElement(newFriend);
  friendListDiv.appendChild(newFriendElement);

  // 滚动到新添加的好友元素
  newFriendElement.scrollIntoView({ behavior: 'smooth' });

  friendNameInput.value = '';
  friendEmailInput.value = '';

  // 检查是否需要显示 "Clear List" 按钮
  const clearListButton = document.getElementById('clear-list-btn')!;
  if (friends.length > 0) {
    clearListButton.style.display = 'block';
  }
}

// 删除好友
function removeFriend(id: string) {
  friends = friends.filter((friend) => friend.id !== id);
  saveFriends();

  // 从 DOM 中移除对应的好友元素
  const friendItem = document.querySelector(`.friend-item[data-id="${id}"]`);
  if (friendItem) {
    friendItem.remove();
  }

  // 检查是否需要隐藏 "Clear List" 按钮
  const clearListButton = document.getElementById('clear-list-btn')!;
  if (friends.length === 0) {
    clearListButton.style.display = 'none';
  }
}

// 清空好友列表
function clearFriendList() {
  if (confirm('Are you sure you want to clear your Friend List?')) {
    friends = []; // 清空好友数组
    saveFriends(); // 保存空列表到 localStorage

    // 清空 DOM 中的好友列表
    const friendListDiv = document.getElementById('friend-list')!;
    friendListDiv.innerHTML = '';

    // 隐藏 "Clear List" 按钮
    const clearListButton = document.getElementById('clear-list-btn')!;
    clearListButton.style.display = 'none';
  }
}

// 初始化加载
window.onload = () => {
  displayFriends();

  // 添加按钮的监听器
  const addFriendButton = document.getElementById('add-friend-btn')!;
  addFriendButton.addEventListener('click', addFriend);

  // 同步按钮的监听器
  const syncButton = document.getElementById('sync-btn')!;
  syncButton.addEventListener('click', syncFriends);

  // 首页按钮的监听器
  const homeButton = document.getElementById('home-btn')!;
  homeButton.addEventListener('click', () => {
    window.location.href = './index.html';
  });

  // "Clear List" 按钮的监听器
  const clearListButton = document.getElementById('clear-list-btn')!;
  clearListButton.addEventListener('click', clearFriendList);
};

// 同步功能（占位函数）
function syncFriends() {
  alert('Sync function not implemented yet.');
}

function loadFriends(): IFriend[] {
  // TODO: read friends from local storage
  return [];
}

function createRawFriendElement(friend: IFriend): HTMLElement {
  // TODO: create an HTML friend element without any listeners attached
  return new HTMLElement();
}

function addBehaviorToFriendElement(friendEmnt: HTMLElement): HTMLElement {
  // TODO: add required listeners to the  HTML friend element
  return new HTMLElement();
}

function appendFriendElementToDocument(friendEmnt: HTMLElement): void {
  // TODO: add HTML friend element with listeners to the right HTML elememnt in the document
}

function loadFriendsIntoDocument(): void {
  // TODO: read friends from local storage and add them to the document
}

function onAddFriend(): void {
  // TODO: event handler to create a new friend from form info and append it to right HTML element in the document
}

function onDeleteFriend(friend: IFriend): void {
  // TODO: event handler to remove an existing friend from local storage and the document
}

function onInviteFriend(friend: IFriend): void {
  // TODO: event handler to invite a friend by email when a checkbox is checked
}

// TODO

// Split into multiple submodules if appropriate
