import { updateUIForLoggedInUser } from './main.js';

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Current origin:', window.location.origin);

let googleInitialized = false;

export function initAuth() {
  if (googleInitialized) return;
  console.log('initAuth called');
  const API_URL = process.env.API_URL;
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

  const loginButton = document.getElementById('loginButton');
  const modal = document.getElementById('loginModal');
  const closeButton = modal.querySelector('.close');
  const createAccountCheckbox = document.getElementById('createAccount');
  const submitButton = document.getElementById('submitButton');
  const modalTitle = document.getElementById('modalTitle');
  const loginForm = document.getElementById('loginForm');
  const emailGroup = document.getElementById('emailGroup');
  const usernameLabel = document.getElementById('usernameLabel');
  const usernameOrEmailInput = document.getElementById('usernameOrEmail');
  const usernameOrEmailLabel = document.getElementById('usernameOrEmailLabel');
  const loginModal = document.getElementById('loginModal');

  createAccountCheckbox.addEventListener('change', () => {
      if (createAccountCheckbox.checked) {
          usernameOrEmailLabel.textContent = 'Username:';
          emailGroup.style.display = 'block';
          submitButton.textContent = 'Register';
          modalTitle.textContent = 'Create Account';
      } else {
          usernameOrEmailLabel.textContent = 'Email or Username:';
          emailGroup.style.display = 'none';
          submitButton.textContent = 'Login';
          modalTitle.textContent = 'Login';
      }
  });

  loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameOrEmail = usernameOrEmailInput.value;
      const password = document.getElementById('password').value;
      const isCreatingAccount = createAccountCheckbox.checked;

      let errors = [];
      if (isCreatingAccount) {
          const email = document.getElementById('email').value;
          errors = validateInput(usernameOrEmail, email, password);
      } else {
          errors = validateInput(null, null, password);
      }

      if (errors.length > 0) {
          alert(errors.join('\n'));
          return;
      }

      let body;
      if (isCreatingAccount) {
          const email = document.getElementById('email').value;
          body = { username: usernameOrEmail, email, password };
      } else {
          body = { usernameOrEmail, password };
      }

      const endpoint = isCreatingAccount ? '/api/auth/register' : '/api/auth/login';

      try {
          console.log('Sending request:', { 
              endpoint, 
              body: { ...body, password: password.replace(/./g, '*') } 
          });
          const response = await fetch(`${API_URL}${endpoint}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
          });

          const data = await response.json();
          console.log('Response:', { status: response.status, data });

          if (!response.ok) {
              throw new Error(data.message || 'An error occurred');
          }

          if (isCreatingAccount) {
              // Automatically log in after registration
              const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ usernameOrEmail: body.username, password: body.password }),
              });
              const loginData = await loginResponse.json();
              if (!loginResponse.ok) {
                  throw new Error(loginData.message || 'Error logging in after registration');
              }
              data.token = loginData.token;
              data.username = loginData.username;
          }

          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          localStorage.setItem('profilePictureUrl', data.profilePictureUrl); // Add this line
          updateUIForLoggedInUser(data.username, data.profilePictureUrl);
          alert(isCreatingAccount ? 'Account created and logged in successfully!' : 'Logged in successfully!');
          loginModal.style.display = 'none';  // Close the modal
      } catch (error) {
          console.error('Error details:', error);
          alert(error.message);
      }
  });

  loginButton.addEventListener('click', () => {
      modal.style.display = 'block';
  });

  closeButton.addEventListener('click', () => {
      modal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
      if (event.target === modal) {
          modal.style.display = 'none';
      }
  });

  function updateUIForLoggedInUser(username, profilePictureUrl) {
      const loginButton = document.getElementById('loginButton');
      const playerInfo = document.getElementById('playerInfo');
      const burgerMenu = document.getElementById('burgerMenu');
      const usernameDisplay = document.getElementById('usernameDisplay');
      const profilePic = document.getElementById('profilePic');

      loginButton.style.display = 'none';
      playerInfo.style.display = 'flex';
      burgerMenu.style.display = 'block';
      usernameDisplay.textContent = username;

      if (profilePictureUrl) {
          profilePic.src = profilePictureUrl.startsWith('http') ? profilePictureUrl : `${API_URL}${profilePictureUrl}`;
      } else {
          profilePic.src = 'default-pfp.jpg';
      }
  }

  // Check if user is already logged in on page load
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const profilePictureUrl = localStorage.getItem('profilePictureUrl');
  if (token && username) {
      updateUIForLoggedInUser(username, profilePictureUrl);
  }

  // Add this function to load the Google API client library
  async function loadGoogleScript() {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
          return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
      });
  }

  // Modify the handleGoogleSignIn function
  async function handleGoogleSignIn() {
      if (googleInitialized) return;
      console.log('handleGoogleSignIn called');
      try {
          console.log('Loading Google script...');
          await loadGoogleScript();
          console.log('Google script loaded successfully');
          
          console.log('Initializing Google Sign-In...');
          google.accounts.id.initialize({
              client_id: process.env.GOOGLE_CLIENT_ID,
              callback: handleGoogleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: false
          });
          console.log('Google Sign-In initialized successfully');
          
          // Add click event listener to your existing button
          document.getElementById('googleSignIn').addEventListener('click', () => {
              console.log('Google Sign-In button clicked');
              google.accounts.id.prompt((notification) => {
                  console.log('Prompt notification:', notification);
                  if (notification.isNotDisplayed()) {
                      console.error('One Tap dialog was not displayed:', notification.getNotDisplayedReason());
                  } else if (notification.isSkippedMoment()) {
                      console.log('One Tap dialog was skipped:', notification.getSkippedReason());
                  } else {
                      console.log('One Tap dialog was displayed');
                  }
              });
          });
          googleInitialized = true;
      } catch (error) {
          console.error('Error in handleGoogleSignIn:', error);
      }
  }

  async function handleGoogleCredentialResponse(response) {
      if (response.credential) {
          console.log('Received ID token:', response.credential);
          try {
              const result = await fetch(`${API_URL}/api/auth/google`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ token: response.credential }),
              });
              if (!result.ok) {
                  const errorText = await result.text();
                  console.error('Server response:', errorText);
                  throw new Error(`HTTP error! status: ${result.status}`);
              }
              const data = await result.json();
              localStorage.setItem('token', data.token);
              localStorage.setItem('username', data.username);
              localStorage.setItem('profilePictureUrl', data.profilePictureUrl);
              updateUIForLoggedInUser(data.username, data.profilePictureUrl);
              document.getElementById('loginModal').style.display = 'none';
          } catch (error) {
              console.error('Error processing Google Sign-In:', error);
              alert('An error occurred while processing Google Sign-In. Please try again.');
          }
      }
  }

  handleGoogleSignIn();
}

// Function to handle successful authentication
function handleAuthSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const username = urlParams.get('username');
  const profilePictureUrl = urlParams.get('profilePictureUrl');

  if (token && username) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('profilePictureUrl', profilePictureUrl);
    updateUIForLoggedInUser(username, profilePictureUrl);
    history.pushState(null, '', '/'); // Remove query parameters from URL
  }
}

// Call handleAuthSuccess on page load
document.addEventListener('DOMContentLoaded', handleAuthSuccess);

function displayPasswordRequirements() {
    const requirementsDiv = document.createElement('div');
    requirementsDiv.id = 'passwordRequirements';
    requirementsDiv.innerHTML = `
        <p>Password must:</p>
        <ul>
            <li>Be at least 8 characters long</li>
            <li>Contain at least one number</li>
            <li>Contain at least one uppercase letter</li>
            <li>Contain at least one lowercase letter</li>
            <li>Contain at least one special character (!@#$%^&*(),.?":{}|<>)</li>
        </ul>
    `;
    const passwordInput = document.getElementById('password');
    passwordInput.parentNode.insertBefore(requirementsDiv, passwordInput.nextSibling);
}

function validateInput(username, email, password) {
  const errors = [];
  if (username && username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Invalid email format');
  }
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  // Add more password validation rules as needed
  return errors;
}