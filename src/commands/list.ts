import { Message } from 'discord.js';
import { Command, CommandMessage } from 'discord.js-commando';
import AiteClient from '../client';

export default class ListCommand extends Command {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  client: AiteClient;
  constructor(client: AiteClient) {
    super(client, {
      name: 'list',
      memberName: 'list',
      group: 'aite',
      description: 'Lists running processes.',
      examples: ['list'],
    });
  }

  async run(
    message: CommandMessage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromPattern: boolean,
  ): Promise<Message | Array<Message>> {
    this.client.processes.listProcesses(message);
    return [];
  }
}
