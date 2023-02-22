const supabase = require('./conn');

async function login(user) {
    let { data: users, error } = await supabase
    .from('users')
    .select('id, username, created_at')
    .like('username', user.username)
    .like('password', user.password)
    if (users.length == 1) {
        return users[0];
    } else {
        return null;
    }
}

module.exports = {
    login: login
}