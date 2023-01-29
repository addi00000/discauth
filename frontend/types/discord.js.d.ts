import { Command } from "./../classes/Command";
import { Event } from "./../classes/Event";
import { Collection } from "discord.js"

declare module "discord.js" {
    export interface Client {
        events: Collection<String, Event>
        commands: Collection<String, Command>
        prefix: string
    }
}