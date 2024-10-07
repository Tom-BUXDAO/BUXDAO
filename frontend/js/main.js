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

    connectWallet.addEventListener('click', (e) => {
        e.preventDefault();
        // Implement connect wallet functionality
        console.log('Connect wallet clicked');
    });

    changePFP.addEventListener('click', async (e) => {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('profilePicture', file);

                try {
                    const response = await fetch('http://localhost:5000/api/users/change-pfp', { // Updated URL
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formData
                    });

                    if (response.ok) {
                        const result = await response.json();
                        document.getElementById('profilePic').src = `http://localhost:5000${result.profilePictureUrl}`;
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

    deleteAccount.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch('http://localhost:5000/api/users/delete-account', { // Updated URL
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

    logOut.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('profilePictureUrl'); // Add this line
        alert('You have been logged out successfully.');
        window.location.reload();
    });
});
