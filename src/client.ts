import { CommandoClient, CommandoClientOptions } from 'discord.js-commando';
import ProcessRegistry from './processes';

export default class AiteClient extends CommandoClient {
  processes: ProcessRegistry;
  constructor(options?: CommandoClientOptions) {
    super(options);
    this.processes = new ProcessRegistry();
  }
}
