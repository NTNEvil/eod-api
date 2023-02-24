const supabase = require('./conn');
const createError = require('http-errors');

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

async function getStore(){
    let result = [];
    let { data: store, error1 } = await supabase
        .from('store')
        .select('*')
    
    for (let i = 0; i < store.length; i++){
        let { data: item, error2 } = await supabase
        .from('items')
        .select('*')
        .eq('id', store[i].item_id)
        
        let model = {};
        model.id = store[i].id;
        model.name = item[0].name;
        model.price = store[i].price;
        model.description = item[0].description;
        model.img = item[0].img;
        result.push(model);
    }
    return result;
}

async function buyItem(userId, storeId){
    let { data: profiles, error1 } = await supabase
        .from('profiles')
        .select('money')
        .eq('user_id', userId)
    if (profiles[0] == undefined) throw createError(404, 'User not found');
    const money = profiles[0].money;
    
    let { data: store, error2 } = await supabase
        .from('store')
        .select('*')
        .eq('id', storeId)
    const itemstore = store[0];
    if (itemstore == undefined) throw createError(404, 'Item not found in store');
    const balance = money - itemstore.price;
    if (balance < 0) throw createError(403, 'Insufficient funds');
    
    const { data2, error3 } = await supabase
        .from('profiles')
        .update({ money: balance })
        .eq('user_id', userId)

    const { data3, error } = await supabase
        .from('inventory')
        .insert([
          { item_id: itemstore.item_id, user_id: userId },
        ])
    return {'msg': 'Purchase made successfully'};
}

async function getMoney(userId){
    let { data: profiles, error } = await supabase
        .from('profiles')
        .select('money')
        .eq('user_id', userId)
    if (profiles[0] == undefined) throw createError(404, 'User not found');
    const money = profiles[0].money;
    // gold
    const gold = Math.floor(money/1000);
    const restGold = money % 1000;
    // silver
    const silver = Math.floor(restGold/100);
    const restSilver = restGold % 100;
    // bronze
    const bronze = restSilver;
    // result
    const result = {};
    result.gold = gold;
    result.silver = silver;
    result.bronze = bronze;
    
    return result;
}

module.exports = {
    login,
    getProfile,
    getProfiles,
    getInventory,
    buyItem,
    getMoney,
    getStore
}