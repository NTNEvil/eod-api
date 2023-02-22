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

async function getProfile(userId){
    let { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    if (profiles.length == 1) {
        return profiles[0];
    } else {
        return null;
    }
}

async function getProfiles(){
    let { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    return profiles;
}

module.exports = {
    login,
    getProfile,
    getProfiles
}