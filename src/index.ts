import path from 'path';
import AiteClient from './client';

const client = new AiteClient({
  owner: '106162668032802816',
  commandPrefix: 'a!',
});

client.registry
  .registerGroup('aite')
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(process.env.AITE_DISCORD_TOKEN);
