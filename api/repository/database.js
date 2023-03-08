const supabase = require('./conn');
const createError = require('http-errors');

const attNames = ['str', 'dex', 'cons', 'wis', 'int', 'charm', 'luck'];
const races = ['Humano', 'Dragonborn', 'Tiefling', 'Fada', 'Anão', 'Elfo', 'Orc'];

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

async function getStatus(userId) {
    let { data: status, error } = await supabase
        .from('status')
        .select('*')
        .eq('user_id', userId);
    if (status[0] == undefined) throw createError(404, 'User not found');
    const statusData = status[0];
    return statusData;
}

async function getStatusShow(userId) {
    const status = await getStatus(userId);
    status.max_xp = status.lv * 100;
    status.max_hp = 100 + (status.cons * 10);
    status.max_mp = 100 + (status.int * 10);
    status.damage = 10 + status.str;
    if (status.weapon != null) {
        const item = await getInvItem(userId, status.weapon);
        status.damage += item.value1;
    }
    return status;
}

async function addStatus(userId, att) {
    const status = await getStatus(userId);

    if (!attNames.includes(att)) throw createError(404, 'Attribute does not exist');

    if (status.free_point <= 0) throw createError(403, 'Insufficient points');

    console.log({ free_point: status.free_point - 1, [att]: status[att] + 1 });
    const { data, error } = await supabase
        .from('status')
        .update({ free_point: status.free_point - 1, [att]: status[att] + 1 })
        .eq('id', status.id);
    return true;
}

async function getInventory(userId) {

    let result = [];

    let { data: inventory, error1 } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)

    for (let i = 0; i < inventory.length; i++) {
        let { data: item, error2 } = await supabase
            .from('items')
            .select('*')
            .eq('id', inventory[i].item_id)

        let modelitem = {}
        modelitem.id = inventory[i].id;
        modelitem.name = item[0].name;
        modelitem.description = item[0].description;
        modelitem.img = item[0].img;
        modelitem.consumable = item[0].consumable;
        modelitem.equipped = inventory[i].equipped;
        result.push(modelitem);
    }

    return result;
}

async function getItem(itemId) {
    if (isNaN(itemId)) throw createError(400, 'Value invalid');
    let { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
    if (items[0] == undefined) throw createError(404, 'Item not found');
    return items[0]
}

async function getInvItem(userId, invId) {
    // get inv item
    let { data: invItems } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', invId)
        .eq('user_id', userId)
    if (invItems[0] == undefined) throw createError(404, 'Item not found');
    const invItem = invItems[0];

    const itemData = await getItem(invItem.item_id);
    return itemData;
}

async function getInvItemShow(userId, invId) {
    // get inv item
    let { data: invItems } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', invId)
        .eq('user_id', userId)
    if (invItems[0] == undefined) throw createError(404, 'Item not found');
    const invItem = invItems[0];

    const itemData = await getItem(invItem.item_id);
    result = invItem;
    result.data = itemData;
    return result;
}

async function dbSetEquippedItem(status, invItem, slot) {
    // mark old item unequipped
    if (status[slot] != null) {
        await supabase
            .from('inventory')
            .update({ equipped: false })
            .eq('id', status[slot]);
    }

    // mark equipped
    invItem.equipped = true;
    await supabase
        .from('inventory')
        .update(invItem)
        .eq('id', invItem.id);

    // set to status
    status[slot] = invItem.id;
    await supabase
        .from('status')
        .update(status)
        .eq('id', status.id);
}

async function equipItem(userId, invId) {
    // checker 
    if (invId == null) throw createError(404, 'Inventory id invalid');

    // get status
    const status = await getStatus(userId);

    // get inv item
    let { data: invItems } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', invId)
        .eq('user_id', userId)
    if (invItems[0] == undefined) throw createError(404, 'Item not found');
    const invItem = invItems[0];

    const itemData = await getItem(invItem.item_id);

    // weapon
    switch (itemData.type) {
        case 'weapon':
            await dbSetEquippedItem(status, invItem, 'weapon');
            break;

        case 'armor':
            await dbSetEquippedItem(status, invItem, 'armor');
            break;

        case 'shield':
            await dbSetEquippedItem(status, invItem, 'shield');
            break;

        default:
            throw createError(400, 'This item cannot be equipped');
    }

    return { 'msg': 'The item has been equipped' };
}

async function unequipItem(userId, invId) {
    // checker 
    if (invId == null) throw createError(404, 'Inventory id invalid');

    // get status
    const status = await getStatus(userId);

    // get inv item
    let { data: invItems } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', invId)
        .eq('user_id', userId)
    if (invItems[0] == undefined) throw createError(404, 'Item not found');
    const invItem = invItems[0];

    const itemData = await getItem(invItem.item_id);

    // mark unequip
    invItem.equipped = false;
    await supabase
        .from('inventory')
        .update(invItem)
        .eq('id', invItem.id);

    // set player status to null
    status[itemData.type] = null;
    await supabase
        .from('status')
        .update(status)
        .eq('id', status.id);
    return { 'msg': 'Item unequipped' }
}

async function useItem(userId, invId) {
    // checker 
    if (invId == null) throw createError(404, 'Inventory id invalid');

    // get status
    const status = await getStatus(userId);

    // get inv item
    let { data: invItems } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', invId)
        .eq('user_id', userId)
    if (invItems[0] == undefined) throw createError(404, 'Item not found');
    const invItem = invItems[0];

    const itemData = await getItem(invItem.item_id);
    if (itemData.consumable == false) throw createError(400, 'This item cannot be used');

    switch (itemData.type) {
        case 'potionHp':
            // reg hp
            const maxHp = (status.cons*10)+100;
            if (status.hp >= maxHp) throw createError(400, 'Your hp is already full');

            const resultHp = status.hp + itemData.value1;
            if (resultHp > maxHp) {
                status.hp = maxHp;
            } else {
                status.hp = resultHp;
            }

            // update database
            await supabase
                .from('status')
                .update(status)
                .eq('id', status.id);
            break;

        case 'potionMana':
            // reg mana
            const maxMp = (status.int*10)+100;
            if (status.mp >= maxMp) throw createError(400, 'Your mp is already full');

            const resultMp = status.mp + itemData.value1;
            if (resultMp > maxMp) {
                status.mp = maxMp;
            } else {
                status.mp = resultMp;
            }
            
            // update database
            await supabase
                .from('status')
                .update(status)
                .eq('id', status.id);
            break;

        default:
            throw createError(400, 'This item cannot be used');
    }

    // remove used item
    await supabase
        .from('inventory')
        .delete()
        .eq('id', invItem.id);

    return { 'msg': 'Item successfully used' };
}

async function getStore() {
    let result = [];
    let { data: store, error1 } = await supabase
        .from('store')
        .select('*')

    for (let i = 0; i < store.length; i++) {
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

async function buyItem(userId, storeId) {
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
    return { 'msg': 'Purchase made successfully' };
}

async function getMoney(userId) {
    let { data: profiles, error } = await supabase
        .from('profiles')
        .select('money')
        .eq('user_id', userId)
    if (profiles[0] == undefined) throw createError(404, 'User not found');
    const money = profiles[0].money;
    // gold
    const gold = Math.floor(money / 1000);
    const restGold = money % 1000;
    // silver
    const silver = Math.floor(restGold / 100);
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

async function addMoney(userId, value) {
    let { data: profiles } = await supabase
        .from('profiles')
        .select('money')
        .eq('user_id', userId)
    if (profiles[0] == undefined) throw createError(404, 'User not found');
    if (isNaN(parseInt(value))) throw createError(400, 'Value invalid');
    const newMoney = profiles[0].money + parseInt(value);

    await supabase
        .from('profiles')
        .update({ money: newMoney })
        .eq('user_id', userId);
    return { 'msg': 'Money added successfully' };
}

async function roulette(userId, itemId) {
    const { data: items, error1 } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId);
    if (items[0] == undefined) throw createError(404, 'Item not found');

    const { data2, error2 } = await supabase
        .from('inventory')
        .insert([
            { item_id: itemId, user_id: userId },
        ])
    return { 'msg': 'Item adicionado ao inventario!' };
}

// TCT
function calculateAddXp(lvInit, xpInit, xpAdd, freePointInit) {
    let lv = lvInit;
    let xp = parseInt(xpInit) + parseInt(xpAdd);
    let maxXp = lv * 100;
    let freePoint = freePointInit;
    let leveledUp = 0;
    while (xp >= maxXp) {
        xp -= maxXp;
        lv++;
        leveledUp++;
        freePoint += 5;
        maxXp = lv * 100;
    }
    return { lv: lv, xp: xp, free_point: freePoint, leveledUp: leveledUp };
}

function lvUp(race, status) {
    if (!races.includes(race)) throw createError(400, 'Race invalid!');
    switch (race) {
        case 'Humano':
            status.str++;
            status.dex++;
            status.cons++;
            status.wis++;
            status.int++;
            break;
        case 'Dragonborn':
            status.str += 2;
            status.cons++;
            break;
        case 'Tiefling':
            status.dex += 2;
            status.wis++;
            status.int++;
            break;
        case 'Fada':
            status.str--;
            status.dex += 3;
            status.cons--;
            status.wis += 2;
            status.int += 2;
            break;
        case 'Anão':
            status.str += 2;
            status.cons += 2;
            break;
        case 'Elfo':
            status.dex += 2;
            status.wis += 2;
            status.int++;
            break;
        case 'Orc':
            status.str += 3;
            status.cons += 2;
            status.int--;
            break;
        default:
            break;
    }
    return status;
}

async function tct(userId, value) {
    if (isNaN(value)) throw createError(400, 'Invalid value');
    value /= 10;
    let status = await getStatus(userId);
    const result = calculateAddXp(status.lv, status.xp, value, status.free_point);
    console.log(result);

    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);
    const race = profile[0].race;

    for (let i = 0; i < result.leveledUp; i++) {
        status = lvUp(race, status);
    }

    status.xp = result.xp;
    status.lv = result.lv;
    status.free_point = result.free_point;

    await supabase
        .from('status')
        .update(status)
        .eq('id', status.id);

    // logs
    await supabase
        .from('logs')
        .insert([
            { text: `USER: ${userId} POINTS: ${value}` },
        ]);

    return { 'msg': 'O tct foi registrado!' };
}

async function hp(userId, value) {
    if (isNaN(value)) throw createError(400, 'Invalid value');
    value = parseInt(value);
    let status = await getStatus(userId);
    status.hp = (status.hp + value);

    await supabase
        .from('status')
        .update(status)
        .eq('id', status.id);
    return { 'msg': 'O status foi atualizado!' };
}

module.exports = {
    login,
    getProfile,
    getProfiles,
    getStatusShow,
    addStatus,
    getInventory,
    getInvItemShow,
    equipItem,
    unequipItem,
    useItem,
    buyItem,
    getMoney,
    addMoney,
    getStore,
    roulette,
    tct,
    hp
}