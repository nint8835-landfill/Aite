import { Message } from 'discord.js';
import { Command, CommandMessage } from 'discord.js-commando';
import AiteClient from '../client';

export default class StdinCommand extends Command {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  client: AiteClient;
  constructor(client: AiteClient) {
    super(client, {
      name: 'stdin',
      memberName: 'stdin',
      group: 'aite',
      description: 'Writes to stdin of a running process.',
      examples: ['stdin 1200 "hello"'],
      ownerOnly: true,
      args: [
        {
          key: 'pid',
          type: 'integer',
          prompt: 'Enter process PID',
        },
        {
          key: 'text',
          type: 'string',
          prompt: 'Enter text to write',
        },
      ],
    });
  }

  async run(
    message: CommandMessage,
    args: { pid: number; text: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromPattern: boolean,
  ): Promise<Message | Array<Message>> {
    const process = this.client.processes.processes[args.pid];
    if (!process) {
      message.reply('Specified PID does not exist.');
    }
    process.process.stdin?.write(args.text + '\n');
    return [];
  }
}
