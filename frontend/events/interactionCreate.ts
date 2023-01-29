import { BaseInteraction, EmbedBuilder, GuildMemberRoleManager } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { supabaseClient } from "..";
import { Event } from "../classes/Event";
import { EventConfig } from "../classes/EventConfig";

let eventConfig: EventConfig = {
    name: 'interactionCreate'
};

const listenerFunction = async (interaction: BaseInteraction) => {
    console.log(`Event "${eventConfig.name}" triggered.`)

    if (interaction.isButton()) {
        if (interaction.customId === 'verify') {
            let userID = interaction.user.id;
            let guildID = interaction.guild.id;

            const embed = new EmbedBuilder()
                .setDescription("Verifying, please wait...")
                .setColor(0xFFFF00)
            await interaction.reply({ embeds: [embed], ephemeral: true });

            supabaseClient.from('users').select('user_id').eq('user_id', userID).then((result) => {
                if (result.data.length === 0) {
                    const embed = new EmbedBuilder()
                        .setDescription("It seems that you haven't connected your Discord account to the server yet. Please do so by clicking the Connect button above.")
                        .setColor(0xff0000)
                    interaction.editReply({ embeds: [embed] });
                } else {
                    let guildData = JSON.parse(readFileSync('./data/guildData.json', 'utf8'));
                    if (guildData[guildID]) {
                        let verificationChannel = guildData[guildID].verificationChannel;
                        let nonVerifiedRole = guildData[guildID].roles.nonVerified;
                        let verifiedRole = guildData[guildID].roles.verified;

                        if (interaction.channel.id === verificationChannel) {
                            let roleManager = interaction.member.roles as GuildMemberRoleManager;
                            roleManager.remove(nonVerifiedRole);
                            roleManager.add(verifiedRole);

                            if (!guildData[guildID].users.includes(userID)) {
                                guildData[guildID].users.push(userID);
                            }

                            writeFileSync('./data/guildData.json', JSON.stringify(guildData, null, 4));

                            const embed = new EmbedBuilder()
                                .setDescription("You have been verified!")
                                .setColor(0x00ff00)
                            interaction.editReply({ embeds: [embed] });
                        }
                    }
                }
            })
        }
    }
}


export default new Event(eventConfig, listenerFunction);
