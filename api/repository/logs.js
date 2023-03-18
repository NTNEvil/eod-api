const supabase = require('./conn');

async function create(message, activity, userId){
    // logs
    await supabase
        .from('logs')
        .insert([
            { 
                text: message,
                activity: activity,
                user_id: userId
            },
        ]);
    return true;
}

module.exports = {
    create
}