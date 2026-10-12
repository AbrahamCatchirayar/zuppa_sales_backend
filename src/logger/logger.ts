/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logDirectory: string;

  private logFileStream: fs.WriteStream;

  private currentLogDate: string;

  constructor() {
    this.logDirectory = path.join(__dirname, '..', '..', 'logs');
    this.currentLogDate = this.getCurrentDate();
    this.createLogFileIfNotExists();

    this.overrideConsoleMethods();
  }

  log(message: any, ...optionalParams: any[]) {
    this.writeLog('LOG', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.writeLog('ERROR', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.writeLog('WARN', message, ...optionalParams);
  }

  info(message: any, ...optionalParams: any[]) {
    this.writeLog('INFO', message, ...optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.writeLog('DEBUG', message, ...optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.writeLog('VERBOSE', message, ...optionalParams);
  }

  private writeLog(level: string, message: any, ...optionalParams: any[]) {
    const logMessage = `[${new Date().toISOString()}] [${level}] ${message} ${optionalParams.join(' ')}\n`;

    // Write to console
    process.stdout.write(logMessage);

    // Check if the date has changed since last log write
    const currentDate = this.getCurrentDate();
    if (currentDate !== this.currentLogDate) {
      this.currentLogDate = currentDate;
      this.createLogFileIfNotExists();
    }

    // Write to log file
    this.logFileStream.write(logMessage);
  }

  private overrideConsoleMethods() {
    console.error = (...args: any[]) => this.error(args.join(' '));
  }

  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = `0${now.getMonth() + 1}`.slice(-2);
    const day = `0${now.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  }

  private createLogFileIfNotExists() {
    const logFilePath = path.join(
      this.logDirectory,
      `${this.currentLogDate}.log`,
    );

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }

    // Create log file if it doesn't exist
    if (!fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, '', 'utf-8');
    }

    // Create or update log file stream
    if (this.logFileStream) {
      this.logFileStream.close();
    }
    this.logFileStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  }
}
