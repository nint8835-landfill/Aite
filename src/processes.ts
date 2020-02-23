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
    message.embed(embed);

    childProcess.on('exit', code => {
      const embed = new RichEmbed({
        title: 'Process Exited',
      });
      embed.setColor(code === 0 ? 'GREEN' : 'RED');
      embed.addField('Exit code', code);
      embed.addField('Command', `\`\`\`${Util.escapeMarkdown(args)}\`\`\``);
      embed.addField('PID', childProcess.pid);
      embed.setFooter(
        `Started ${moment.duration(startTime.diff(moment())).humanize()} ago.`,
      );
      message.embed(embed);
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
            title: `New Output from PID ${childProcess.pid}`,
          });
          embed.setColor('GREY');
          embed.setDescription(
            `\`\`\`\n${Util.escapeMarkdown(splitMessage)}\n\`\`\``,
          );
          embed.addField('Command', `\`\`\`${Util.escapeMarkdown(args)}\`\`\``);
          embed.setFooter(
            `Started ${moment
              .duration(startTime.diff(moment()))
              .humanize()} ago.`,
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
