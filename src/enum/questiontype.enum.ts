/* eslint-disable no-shadow */
export enum QuestionType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  MULTI_SELECT = 'MULTI_SELECT',
  SINGLE_SELECT = 'SINGLE_SELECT',
  DATE = 'DATE',
  File = 'FILE',
  MIXED_TYPE = 'MIXED_TYPE',
  URL = 'URL',
}

export enum QuestionCategory {
  GROUP = 'GROUP',
  NORMAL = 'NORMAL',
}

export enum QuestionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum DependencyType {
  QUESTION = 'QUESTION',
  SET_OF_QUESTIONS = 'SET_OF_QUESTIONS',
  FORM = 'FORM',
  MULTI_FORM = 'MULTI_FORM',
}

export enum QuestableType {
  STANDARD = 'STANDARD',
  GROUP = 'GROUP',
}

export enum OptionsType {
  MIXED = 'MIXED',
  GENERAL = 'GENERAL',
}
