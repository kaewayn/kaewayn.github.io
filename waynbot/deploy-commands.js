require('dotenv').config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const commands = [

    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Wayn botun çalışıp çalışmadığını kontrol eder.')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Kanaldaki mesajları siler.')
        .addIntegerOption(option =>
            option
                .setName('miktar')
                .setDescription('Silinecek mesaj sayısı.')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .toJSON()

];

const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

const CLIENT_ID = '1556695891732070503'; 
const GUILD_ID = '1284848918982688859';

(async () => {

    try {

        console.log('Slash komutları yükleniyor...');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log('Slash komutları başarıyla yüklendi!');

    } catch (error) {

        console.error(error);

    }

})();