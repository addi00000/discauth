import { Command } from "../classes/Command";
import { CommandConfig } from "../classes/CommandConfig";
import { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { oauthUri } from "..";

let commandConfig: CommandConfig = {
    title: 'setup',
    description: 'Setup authorisation in your server.',
    category: 'Commands',
    aliases: []
};

const command = async (client: Client, message: Message, args: Array<String>) => {
    const user: any = message.author;
    const guild: any = message.guild;

    if (!client.guilds.cache.get(guild.id).members.cache.get(user.id).permissions.toArray().includes('Administrator')) {
        message.reply('You must be an administrator to use this command.');
        return;
    }

    message.reply('<:info:1046633082779861002> Please send the channel you want to use for the bot. (e.g. #general)');
    let filter = (m: any) => m.author.id === user.id;
    let collector = message.channel.createMessageCollector({ filter, time: 60000 });
    collector.on('collect', async (m: any) => {
        const channel: any = m.mentions.channels.first();
        if (!channel) {
            message.reply('<:Red_X:1046633085711695892> Please send the channel you want to use for the bot. (e.g. #general)');
            return;
        }
        collector.stop();
        m.reply(`<:check:1046633074559045643> using \`${channel}\` as verification channel.`);

        message.reply('<:info:1046633082779861002> Please send the role you want to use for non verified users.');
        let collector2 = message.channel.createMessageCollector({ filter, time: 60000 });
        collector2.on('collect', async (m: any) => {
            const role: any = m.mentions.roles.first() || guild.roles.cache.get(m.content);
            if (!role) {
                message.reply('<:Red_X:1046633085711695892> Please send the role you want to use for non verified users.');
                return;
            }
            collector2.stop();
            m.reply(`<:check:1046633074559045643> using \`${role}\` as non verified role.`);

            message.reply('<:info:1046633082779861002> Please send the role you want to use for verified users.');
            let collector3 = message.channel.createMessageCollector({ filter, time: 60000 });
            collector3.on('collect', async (m: any) => {
                const role2: any = m.mentions.roles.first() || guild.roles.cache.get(m.content);
                if (!role2) {
                    message.reply('<:Red_X:1046633085711695892> Please send the role you want to use for verified users.');
                    return;
                }
                collector3.stop();
                m.reply(`<:check:1046633074559045643> using \`${role2}\` as verified role.`);

                let guildData = JSON.parse(readFileSync('./data/guildData.json', 'utf8'));
                guildData[guild.id] = {
                    verificationChannel: channel.id,
                    roles: {
                        nonVerified: role.id,
                        verified: role2.id
                    },
                    users: []
                };
                writeFileSync('./data/guildData.json', JSON.stringify(guildData, null, 4));


                let embed = new EmbedBuilder()
                    .setTitle('Authorisation')
                    .setDescription('Please click the buttons below to authorise yourself.')
                    .setColor('#FFFFFF')
                    .setTimestamp()
                    .setFooter(
                        {
                            text: 'Authorisation provided by auth.addidix.xyz',
                            iconURL: client.user.displayAvatarURL()
                        }
                    );

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Connect')
                            .setURL(oauthUri)
                            .setStyle(ButtonStyle.Link),

                        new ButtonBuilder()
                            .setCustomId('verify')
                            .setLabel('Verify')
                            .setStyle(ButtonStyle.Success)
                    );

                guild.channels.cache.get(channel.id)
                    .send({ embeds: [embed], components: [row] });
                
                message.reply('<:check:1046633074559045643> Setup complete.');
            });
        });
    });

}

export default new Command(commandConfig, command);