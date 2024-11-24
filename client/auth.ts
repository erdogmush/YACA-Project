import axios, { AxiosResponse } from 'axios';
import { IResponse } from '../common/server.responses';
import { IUser } from '../common/user.interface';

async function login() {
  // TODO: authenticate the user
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;

  try {
    // 发送登录请求
    const response = await axios.post(`../auth/tokens/${email}`, {
      password
    });
    console.log('Login response:', response.data); // 打印响应数据
    if (response.data.name === 'UserAuthenticated') {
      // 登录成功，保存 token
      const { token, user } = response.data.payload as { token: string; user: IUser };
      localStorage.setItem('token', token); // 保存 token 到 localStorage
      localStorage.setItem('username', user.credentials.username); // 保存用户信息到 localStorage
      alert(`Login successful. Welcome, ${user.credentials.username}!`);
      // 重定向到聊天室页面
      window.location.href = '/chat';
    }
  } catch (error) {
    console.error('Login Error:', error.response); // 打印错误信息
    alert('Login failed: \n' + (error.response?.data?.message || error.message || 'Unknown error'));
  }
}

async function register() {
  // TODO: register the user
  const name = (document.getElementById('name') as HTMLInputElement).value;
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;

  try {
    // 使用绝对路径发送POST请求
    const response = await axios.post('../auth/users', {
      credentials: { username: email, password },
      extra: name
    });

    if (response.data.name === 'UserRegistered') {
      alert('Registration successful');
      clearForm(); // 清空表单
    }
  } catch (error) {
    console.error('Error response:', error.response); // 打印完整的错误响应

    alert(
      'Registration failed: \n' +
        (error.response?.data?.message || error.message || 'Unknown error')
    );
  }
}

// 清空表单
function clearForm() {
  (document.getElementById('name') as HTMLInputElement).value = '';
  (document.getElementById('email') as HTMLInputElement).value = '';
  (document.getElementById('password') as HTMLInputElement).value = '';
}

// 切换密码可见性
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const toggleIcon = document.getElementById('toggle-password') as HTMLElement;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.textContent = '👀'; // 更换图标为“隐藏”
  } else {
    passwordInput.type = 'password';
    toggleIcon.textContent = '🙈'; // 更换图标为“显示”
  }
}

async function onSubmitForm(e: SubmitEvent) {
  // form submission event handler
  e.preventDefault(); // prevent default form submission
  const whichButton: HTMLButtonElement = e.submitter as HTMLButtonElement;
  if (whichButton.id === 'register-button') {
    await register(); // 调用注册函数
  } else if (whichButton.id === 'login-button') {
    await login(); // 调用登录函数
  }
  /* 
  if (...) {
    // login button clicked
    // TODO
  } else if (...) {
    // submit button clicked
    // TODO
  } else {
    // TODO
  }
  */
}

document.addEventListener('DOMContentLoaded', async function (e: Event) {
  // document-ready event handler
  console.log('Page loaded successfully');
  // TODO: anything else?
  document.getElementById('auth-form')?.addEventListener('submit', onSubmitForm);
  document.getElementById('toggle-password')?.addEventListener('click', togglePasswordVisibility); // 监听眼睛图标的点击事件
});
