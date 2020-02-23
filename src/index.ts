import { CommandoClient } from 'discord.js-commando';

const client = new CommandoClient({
  owner: '106162668032802816',
  commandPrefix: 'a!',
});

client.registry.registerDefaults();

client.login(process.env.AITE_DISCORD_TOKEN);
