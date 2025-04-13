import { clsx, type ClassValue } from 'clsx';
import OpenAI from 'openai';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeSegments(segments: OpenAI.Audio.TranscriptionSegment[] | undefined) {
  if (!segments) return;
  return segments.map(({ text, start, end }) => ({
    text: text.trim(),
    startMs: start * 1000,
    endMs: end * 1000,
  }));
}

export function normalizeWords(words: OpenAI.Audio.TranscriptionWord[] | undefined) {
  if (!words) return;
  return words.map(({ word, start, end }) => ({
    text: word.trim(),
    startMs: start * 1000,
    endMs: end * 1000,
  }));
}

export function parseGroqErrorMessage(str: string): string | null {
  const jsonStartIndex = str.indexOf('{');
  if (jsonStartIndex === -1) return null;
  const jsonString = str.substring(jsonStartIndex);
  try {
    const object = JSON.parse(jsonString);
    return object.error.message;
  } catch (error) {
    return null;
  }
}
