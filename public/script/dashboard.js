let logoutButton = document.getElementById('logoutButton')

logoutButton.addEventListener('click', async(event) => {
    event.preventDefault()
    document.cookie = "accountToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.location.href = '/login'
})