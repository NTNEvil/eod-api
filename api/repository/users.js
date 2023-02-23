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

async function getProfile(userId) {
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

async function getProfiles() {
    let { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
    return profiles;
}

async function getInventory(userId) {

    let result = [];

    let { data: inventory, error1 } = await supabase
        .from('inventory')
        .select('id, item_id')
        .eq('user_id', userId)

    for (let i = 0; i < inventory.length; i++) {
        let { data:item, error2 } = await supabase
        .from('items')
        .select('*')
        .eq('id', inventory[i].item_id)

        let modelitem = {}
        modelitem.id = inventory[i].id;
        modelitem.name = item[0].name;
        result.push(modelitem);
    }

    return result;
}

module.exports = {
    login,
    getProfile,
    getProfiles,
    getInventory
}