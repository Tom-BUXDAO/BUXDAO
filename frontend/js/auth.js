const API_URL = 'http://localhost:5000'; // Make sure this matches your backend URL

// Add this at the top of your auth.js file
const GOOGLE_CLIENT_ID = '75308957700-4t4de...'; // Replace with your full Client ID

document.addEventListener('DOMContentLoaded', () => {
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
              const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
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
          profilePic.src = `http://localhost:5000${profilePictureUrl}`;
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
});

const googleSignInButton = document.getElementById('googleSignIn');

// Initialize the Google Sign-In API
function initializeGoogleSignIn() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID
        });
    });
}

// Handle Google Sign-In
function handleGoogleSignIn() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(function(googleUser) {
        const profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Email: ' + profile.getEmail());
        // Here you would typically send this information to your server
        // to create or authenticate the user in your system
    }).catch(function(error) {
        console.error('Error:', error);
    });
}

// Add event listener for the Google Sign-In button
document.getElementById('googleSignIn').addEventListener('click', handleGoogleSignIn);

// Call this function when the page loads
window.onload = initializeGoogleSignIn;

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