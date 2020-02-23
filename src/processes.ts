import { ChildProcess, spawn } from 'child_process';
import { CommandMessage } from 'discord.js-commando';
import { RichEmbed, Util } from 'discord.js';
import moment from 'moment';

type ProcessMap = {
  [pid: number]: {
    process: ChildProcess;
    message: CommandMessage;
    command: string;
    startTime: moment.Moment;
  };
};

export default class ProcessRegistry {
  processes: ProcessMap;
  constructor() {
    this.processes = {};
  }

  static generateStartedDiff(startTime: moment.Moment): string {
    return `Started ${moment
      .duration(startTime.diff(moment()))
      .humanize()} ago.`;
  }

  async listProcesses(message: CommandMessage): Promise<void> {
    for (const [pid, processInfo] of Object.entries(this.processes)) {
      const embed = new RichEmbed({ title: `Process ${pid}` });
      embed.addField(
        'Time Started',
        ProcessRegistry.generateStartedDiff(processInfo.startTime),
      );
      embed.addField(
        'Command',
        `\`\`\`${Util.escapeMarkdown(processInfo.command)}\`\`\``,
      );
      embed.setAuthor(
        `${processInfo.message.author.username}#${processInfo.message.author.discriminator}`,
        processInfo.message.author.avatarURL,
      );
      await message.embed(embed);
    }
  }

  spawnProcess(args: string, message: CommandMessage): ChildProcess {
    const childProcess = spawn(args, { shell: true, stdio: 'pipe' });
    const startTime = moment();
    this.processes[childProcess.pid] = {
      process: childProcess,
      message,
      command: args,
      startTime,
    };

    const embed = new RichEmbed({ title: 'Process Started' });
    embed.setColor('GOLD');
    embed.addField('PID', childProcess.pid);
    embed.addField('Command', `\`\`\`${Util.escapeMarkdown(args)}\`\`\``);
    embed.setAuthor(
      `${message.author.username}#${message.author.discriminator}`,
      message.author.avatarURL,
    );
    message.embed(embed);

    childProcess.on('exit', code => {
      const embed = new RichEmbed({
        title: 'Process Exited',
      });
      embed.setColor(code === 0 ? 'GREEN' : 'RED');
      embed.addField('Exit Code', code);
      embed.addField('Command', `\`\`\`${Util.escapeMarkdown(args)}\`\`\``);
      embed.addField('PID', childProcess.pid);
      embed.setFooter(ProcessRegistry.generateStartedDiff(startTime));
      embed.setAuthor(
        `${message.author.username}#${message.author.discriminator}`,
        message.author.avatarURL,
      );
      message.embed(embed);
      delete this.processes[childProcess.pid];
    });

    let output = '';
    let timeout: NodeJS.Timeout | null;

    const onOutput = (data: Buffer): void => {
      output += data.toString();
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        timeout = null;
        let messages = Util.splitMessage(output);
        output = '';
        if (typeof messages === 'string') {
          messages = [messages];
        }
        for (const splitMessage of messages) {
          const embed = new RichEmbed({
            title: `Output from PID ${childProcess.pid}`,
          });
          embed.setColor('GREY');
          embed.setDescription(
            `\`\`\`\n${Util.escapeMarkdown(splitMessage)}\n\`\`\``,
          );
          embed.addField('Command', `\`\`\`${Util.escapeMarkdown(args)}\`\`\``);
          embed.setFooter(ProcessRegistry.generateStartedDiff(startTime));
          embed.setAuthor(
            `${message.author.username}#${message.author.discriminator}`,
            message.author.avatarURL,
          );
          message.embed(embed);
        }
      }, 100);
    };

    childProcess.stdout.on('data', onOutput);
    childProcess.stderr.on('data', onOutput);

    return childProcess;
  }
}
