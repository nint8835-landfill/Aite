import { Message } from 'discord.js';
import { Command, CommandMessage } from 'discord.js-commando';
import AiteClient from '../client';

export default class SpawnCommand extends Command {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  client: AiteClient;
  constructor(client: AiteClient) {
    super(client, {
      name: 'spawn',
      memberName: 'spawn',
      group: 'aite',
      description: 'Spawns a process.',
      examples: ['spawn ls -l'],
      ownerOnly: true,
    });
  }

  async run(
    message: CommandMessage,
    args: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromPattern: boolean,
  ): Promise<Message | Array<Message>> {
    this.client.processes.spawnProcess(args, message);
    return [];
  }
}
