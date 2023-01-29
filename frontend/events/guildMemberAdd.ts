import { GuildMember } from "discord.js";
import { Event } from "../classes/Event";
import { EventConfig } from "../classes/EventConfig";
import { readFileSync, writeFileSync } from "fs";

let eventConfig: EventConfig = {
  name: "guildMemberAdd",
};

const listenerFunction = async (member: GuildMember) => {
  console.log(`Event "${eventConfig.name}" triggered.`);
  let guildData = JSON.parse(readFileSync("./data/guildData.json", "utf8"));
  if (guildData[member.guild.id]) {
    let nonVerifiedRole = guildData[member.guild.id].roles.nonVerified;
    member.roles.add(nonVerifiedRole);
    let verifChannel = guildData[member.guild.id].channels.verification;
    let message = await verifChannel.send(`Welcome ${member.user.username}, please verify yourself by following the instructions in this channel.`);
    member.send(`Welcome to ${member.guild.name}, please verify yourself by following the instructions in the ${verifChannel.name} channel.`);
    setTimeout(async function() {
      message.delete();
    }, 1000);
  }
};

export default new Event(eventConfig, listenerFunction);
