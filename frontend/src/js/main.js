import { initAuth } from './auth.js';

const API_URL = process.env.API_URL;

document.addEventListener('DOMContentLoaded', () => {
    // Remove or comment out the lines referencing 'app'
    // const app = document.getElementById('app');
    // app.innerHTML = '<h2>Loading BUXDAO data...</h2>';

    // Here you would typically fetch data from your backend API
    // For now, we'll just simulate it with a timeout
    setTimeout(() => {
        // Remove or comment out this line as well
        // app.innerHTML = '<h2>Welcome to BUXDAO!</h2><p>Your decentralized finance platform.</p>';
        
        // If you want to display this content, you should add an element to your HTML
        // and update it here. For example:
        // const welcomeMessage = document.getElementById('welcome-message');
        // if (welcomeMessage) {
        //     welcomeMessage.innerHTML = '<h2>Welcome to BUXDAO!</h2><p>Your decentralized finance platform.</p>';
        // }
    }, 1000);

    // Burger menu functionality
    const connectWallet = document.getElementById('connectWallet');
    const changePFP = document.getElementById('changePFP');
    const deleteAccount = document.getElementById('deleteAccount');
    const logOut = document.getElementById('logOut');

    if (connectWallet) {
        connectWallet.addEventListener('click', (e) => {
            e.preventDefault();
            // Implement connect wallet functionality
            console.log('Connect wallet clicked');
        });
    }

    if (changePFP) {
        changePFP.addEventListener('click', async (e) => {
            e.preventDefault();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    try {
                        const response = await fetch(`${API_URL}/api/users/change-pfp`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: new FormData().append('profilePicture', file)
                        });

                        if (response.ok) {
                            const result = await response.json();
                            document.getElementById('profilePic').src = `${API_URL}${result.profilePictureUrl}`;
                            alert('Profile picture updated successfully!');
                        } else {
                            throw new Error('Failed to update profile picture');
                        }
                    } catch (error) {
                        console.error('Error updating profile picture:', error);
                        alert('Failed to update profile picture. Please try again.');
                    }
                }
            };
            input.click();
        });
    }

    if (deleteAccount) {
        deleteAccount.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                try {
                    const response = await fetch(`${API_URL}/api/users/delete-account`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.ok) {
                        alert('Your account has been deleted successfully.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('username');
                        window.location.reload();
                    } else {
                        throw new Error('Failed to delete account');
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('Failed to delete account. Please try again.');
                }
            }
        });
    }

    if (logOut) {
        logOut.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('profilePictureUrl'); // Add this line
            alert('You have been logged out successfully.');
            window.location.reload();
        });
    }

    // Initialize auth functionality
    initAuth();
});

export function updateUIForLoggedInUser(username, profilePictureUrl) {
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