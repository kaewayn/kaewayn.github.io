require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Events,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ==============================
// AYARLAR
// ==============================

const VERIFY_CHANNEL_ID = '1556720148763648122';
const VERIFIED_ROLE_ID = '1556716565351895210';

// ==============================
// VERIFY BUTONU
// ==============================

const verifyButton = new ButtonBuilder()
    .setCustomId('verify')
    .setLabel('VERIFY')
    .setStyle(ButtonStyle.Success);

const verifyRow = new ActionRowBuilder()
    .addComponents(verifyButton);

// ==============================
// BOT HAZIR
// ==============================

client.once(Events.ClientReady, async (readyClient) => {

    console.log(`Wayn aktif! ${readyClient.user.tag}`);

    readyClient.user.setPresence({
        status: 'dnd',
        activities: [
            {
                name: 'kaewayn.com',
                type: 0
            }
        ]
    });

    try {

        const verifyChannel = await client.channels.fetch(VERIFY_CHANNEL_ID);

        if (!verifyChannel) {
            console.error('Verify kanalı bulunamadı!');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🔐 Sunucuya Giriş')
            .setDescription(
                'Sunucunun diğer bölümlerine erişmek için aşağıdaki **VERIFY** butonuna bas.'
            )
            .setColor(0x5865F2);

        const messages = await verifyChannel.messages.fetch({
            limit: 100
        });

        const verifyMessages = messages.filter(message =>
            message.author.id === readyClient.user.id &&
            message.components.some(row =>
                row.components.some(component =>
                    component.customId === 'verify'
                )
            )
        );

        if (verifyMessages.size > 1) {

            const messagesToDelete = [...verifyMessages.values()].slice(1);

            for (const message of messagesToDelete) {
                await message.delete().catch(() => {});
            }

            console.log('Fazla VERIFY mesajları temizlendi.');
        }

        const existingMessage = verifyMessages.first();

        if (existingMessage) {

            await existingMessage.edit({
                embeds: [embed],
                components: [verifyRow]
            });

            console.log('Mevcut VERIFY mesajı kullanıldı.');

        } else {

            await verifyChannel.send({
                embeds: [embed],
                components: [verifyRow]
            });

            console.log('VERIFY mesajı oluşturuldu!');
        }

    } catch (error) {

        console.error(
            'VERIFY mesajı işlemi başarısız:',
            error
        );

    }
});

// ==============================
// ETKİLEŞİMLER
// ==============================

client.on(Events.InteractionCreate, async (interaction) => {

    // ==========================
    // VERIFY
    // ==========================

    if (interaction.isButton() && interaction.customId === 'verify') {

        const member = interaction.member;

        const verifiedRole = member.guild.roles.cache.get(
            VERIFIED_ROLE_ID
        );

        if (!verifiedRole) {

            await interaction.reply({
                content: '❌ VERIFIED rolü bulunamadı.',
                ephemeral: true
            });

            return;
        }

        if (member.roles.cache.has(VERIFIED_ROLE_ID)) {

            await interaction.reply({
                content: 'Sen zaten doğrulanmışsın. ✅',
                ephemeral: true
            });

            return;
        }

        try {

            await member.roles.add(verifiedRole);

            await interaction.reply({
                content: 'Doğrulama başarılı! 🎉',
                ephemeral: true
            });

            console.log(
                `${member.user.tag} VERIFIED oldu.`
            );

        } catch (error) {

            console.error(
                'VERIFIED rolü verilemedi:',
                error
            );

            if (!interaction.replied) {

                await interaction.reply({
                    content: '❌ Doğrulama sırasında bir hata oluştu.',
                    ephemeral: true
                });

            }
        }

        return;
    }

    // ==========================
    // SLASH KOMUTLARI
    // ==========================

    if (!interaction.isChatInputCommand()) return;

    // ==========================
    // /PING
    // ==========================

    if (interaction.commandName === 'ping') {

        await interaction.reply('Pong! 🏓');

        return;
    }

    // ==========================
    // /CLEAR
    // ==========================

    if (interaction.commandName === 'clear') {

        if (
            !interaction.memberPermissions.has(
                PermissionsBitField.Flags.ManageMessages
            )
        ) {

            await interaction.reply({
                content: '❌ Bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın.',
                ephemeral: true
            });

            return;
        }

        const miktar = interaction.options.getInteger('miktar');

        await interaction.deferReply({
            ephemeral: true
        });

        try {

            const messages = await interaction.channel.messages.fetch({
                limit: miktar
            });

            let deletedCount = 0;

            for (const message of messages.values()) {

                try {

                    await message.delete();
                    deletedCount++;

                } catch (error) {

                    console.error(
                        `Mesaj silinemedi: ${message.id}`,
                        error
                    );

                }
            }

            await interaction.editReply({
                content: `🧹 **${deletedCount}** mesaj silindi.`
            });

            console.log(
                `${interaction.user.tag} tarafından ${deletedCount} mesaj silindi.`
            );

        } catch (error) {

            console.error(
                'Mesaj silme hatası:',
                error
            );

            await interaction.editReply({
                content: '❌ Mesajlar silinirken bir hata oluştu.'
            });
        }

        return;
    }

    // ==========================
    // /HELP
    // ==========================

    if (interaction.commandName === 'help') {

        const helpEmbed = new EmbedBuilder()
            .setTitle('🤖 Wayn Komutları')
            .setDescription(
                'Wayn botun mevcut komutları aşağıdadır.'
            )
            .addFields(
                {
                    name: '🏓 /ping',
                    value: 'Wayn botun çalışıp çalışmadığını kontrol eder.'
                },
                {
                    name: '🧹 /clear',
                    value: 'Kanaldaki belirlediğin miktarda mesajı siler.'
                },
                {
                    name: '🔐 VERIFY',
                    value: 'Sunucuya erişim doğrulamasını yapar.'
                }
            )
            .setColor(0x5865F2)
            .setFooter({
                text: 'Wayn • KaeWayn'
            });

        await interaction.reply({
            embeds: [helpEmbed]
        });

        return;
    }
});

// ==============================
// BOTU BAŞLAT
// ==============================

client.login(process.env.DISCORD_TOKEN);