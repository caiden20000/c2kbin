const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
    const kittySchema = new mongoose.Schema({
        name: String
    });
    const Kitten = mongoose.model('Kitten', kittySchema);

    // Reset the database every time we run the script
    await clearCollection(Kitten); 

    const silence = new Kitten({ name: 'Silence' });
    console.log(silence.name); // 'Silence'
    await silence.save();
    console.log(await Kitten.find());
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

async function clearCollection(model) {
    return model.deleteMany({});
}