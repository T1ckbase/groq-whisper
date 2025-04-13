import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Download, Key, Wand2, AlertCircle } from 'lucide-react';
import { languageMap } from './lib/languages';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';
import Github from './components/github-svg';
import { CopyButton } from './components/copy-button';
import OpenAI from 'openai';
import { type Caption, serializeSrt } from '@remotion/captions';
import { normalizeSegments, normalizeWords } from './lib/utils';

interface TranscriptionOutput {
  text: string;
  json: string;
  srt: string;
}

// https://console.groq.com/docs/speech-to-text#supported-models
const models = [
  {
    id: 'whisper-large-v3',
    name: 'Whisper large-v3',
    description: 'Provides state-of-the-art performance with high accuracy for multilingual transcription and translation tasks.',
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper Large V3 Turbo',
    description: 'A fine-tuned version of a pruned Whisper Large V3 designed for fast, multilingual transcription tasks.',
  },
  {
    id: 'distil-whisper-large-v3-en',
    name: 'Distil-Whisper English',
    description: "A distilled, or compressed, version of OpenAI's Whisper model, designed to provide faster, lower cost English speech recognition while maintaining comparable accuracy.",
  },
];

function App() {
  const [apiKey, setApiKey] = useState(() => {
    try {
      const savedApiKey = localStorage.getItem('groqApiKey');
      return savedApiKey || '';
    } catch (error) {
      console.error('Failed to read apiKey from localStorage', error);
      return '';
    }
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [model, setModel] = useState(models[0].id);
  const [language, setLanguage] = useState('auto');
  const [wordTimestamps, setWordTimestamps] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [output, setOutput] = useState<TranscriptionOutput>({
    text: '',
    json: '',
    srt: '',
  });

  const handleApiKeyBlur = (value: string) => {
    localStorage.setItem('groqApiKey', value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile || !apiKey) {
      setErrorMessage('Please select an audio file and provide an API key');
      return;
    }

    setIsTranscribing(true);
    setErrorMessage(null);
    setOutput({
      text: '',
      json: '',
      srt: '',
    });

    try {
      const client = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
        dangerouslyAllowBrowser: true,
      });

      const transcription = await client.audio.transcriptions.create({
        file: audioFile,
        model,
        response_format: 'verbose_json',
        timestamp_granularities: [wordTimestamps ? 'word' : 'segment'],
        ...(language === 'auto' ? {} : { language }),
        temperature: 0,
      });

      const text = transcription.text.trim();

      if (!transcription.segments && !transcription.words) throw new Error('No segments or words found in transcription.');

      const json = JSON.stringify(transcription.segments ?? transcription.words, null, 2);

      const segments = normalizeSegments(transcription.segments) ?? normalizeWords(transcription.words)!;
      const lines: Caption[][] = segments.map((segment) => [segment as Caption]);
      const srt = serializeSrt({ lines });

      setOutput({ text, json, srt });
    } catch (error) {
      console.error('Transcription error:', error);
      // if (error instanceof OpenAI.APIError) {
      //   setErrorMessage(error.message);
      // } else {
      setErrorMessage(error instanceof Error ? error.message : `Transcription error: ${error}`);
      // }
      // setError('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDownload = (content: string, ext: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription.${ext}`;
    a.click();
  };

  return (
    <ThemeProvider defaultTheme='system' storageKey='theme'>
      <div className='bg-background text-foreground flex h-svh max-h-svh w-full flex-col p-4 font-mono'>
        <div className='mx-auto flex h-full w-full max-w-[90rem] flex-col'>
          {/* <h1 className='mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-3xl font-bold text-transparent'>Groq Whisper</h1> */}
          <header className='border-border mb-4 flex items-center justify-between border-b pb-4'>
            <h1 className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent'>Groq Whisper</h1>
            <div className='flex items-center space-x-4'>
              <a href='https://github.com/T1ckbase/groq-whisper' target='_blank' rel='noopener noreferrer'>
                <Github className='h-5 w-5' />
              </a>
              <div className='ml-auto'>
                <ModeToggle />
              </div>
            </div>
          </header>

          <div className='grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]'>
            {/* Left Column - Transcription Output */}
            <div className='flex h-full flex-col space-y-4'>
              <Card className='bg-card/50 border-muted flex flex-1 flex-col p-4 backdrop-blur'>
                <Tabs defaultValue='text' className='flex w-full flex-1 flex-col'>
                  <TabsList className='w-full'>
                    <TabsTrigger value='text' className='flex-1'>
                      Text
                    </TabsTrigger>
                    <TabsTrigger value='json' className='flex-1'>
                      JSON
                    </TabsTrigger>
                    <TabsTrigger value='srt' className='flex-1'>
                      SRT
                    </TabsTrigger>
                  </TabsList>

                  {(['text', 'json', 'srt'] as const).map((format) => (
                    <TabsContent key={format} value={format} className='flex flex-1 flex-col space-y-4'>
                      <div className='relative flex min-h-0 flex-1 flex-col'>
                        {/* <div className='absolute top-2 right-2 space-x-2'> */}
                        <div className='flex justify-end space-x-2 pb-2'>
                          <CopyButton value={output[format]} variant='secondary' size='icon' className='shrink-0' disabled={!output[format]} />
                          <Button variant='secondary' size='icon' onClick={() => handleDownload(output[format], format === 'text' ? 'txt' : format)} disabled={!output[format]}>
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                        <Textarea value={output[format]} className='bg-muted/50 h-full resize-none overflow-auto font-mono text-sm' placeholder={`Transcription will appear here in ${format.toUpperCase()} format`} readOnly />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            </div>

            {/* Right Column - Configuration */}
            <div className='space-y-4'>
              <Card className='bg-card/50 border-muted p-4 backdrop-blur'>
                <h2 className='text-xl font-bold'>Configuration</h2>

                <div className='space-y-5'>
                  {/* API Key Input */}
                  <div className='space-y-2'>
                    <Label>GROQ API Key</Label>
                    <div className='relative'>
                      <Input type='password' required value={apiKey} onChange={(e) => setApiKey(e.target.value)} onBlur={(e) => handleApiKeyBlur(e.target.value)} className='bg-muted/50 pl-9' placeholder='Enter your GROQ API key' />
                      <Key className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
                    </div>
                    <span className='text-sm opacity-40'>
                      Get your key from{' '}
                      <a href='https://console.groq.com/keys' target='_blank' rel='noopener noreferrer' className='underline'>
                        https://console.groq.com/keys
                      </a>
                    </span>
                  </div>

                  <div className='space-y-2'>
                    <Label>Audio File</Label>
                    <div className='flex items-center gap-4'>
                      <Input type='file' accept='.flac,.mp3,.mp4,.mpeg,.mpga,.m4a,.ogg,.wav,.webm' className='bg-muted/50' onChange={handleFileChange} />
                      {/* <Button variant='secondary' size='icon'>
                        <Upload className='h-4 w-4' />
                      </Button> */}
                    </div>
                    <span className='text-sm opacity-40'>40 MB (free tier), 100MB (dev tier). flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm supported</span>
                  </div>

                  <div className='space-y-2'>
                    <Label>Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className='bg-muted/50'>
                        <SelectValue placeholder='Select model' />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(({ name, id }) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className='bg-muted/50'>
                        <SelectValue placeholder='Select language' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='auto'>auto detect</SelectItem>
                        {Object.entries(languageMap).map(([k, v]) => (
                          <SelectItem key={v} value={v}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex items-center justify-between'>
                    <Label htmlFor='word-level-timestamps'>Word-level timestamps</Label>
                    <Switch checked={wordTimestamps} onCheckedChange={setWordTimestamps} id='word-level-timestamps' />
                  </div>

                  <Button className='w-full' onClick={handleTranscribe} disabled={!audioFile || !apiKey || isTranscribing}>
                    {isTranscribing ? (
                      <div className='flex items-center gap-2'>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                        Transcribing...
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <Wand2 className='h-4 w-4' />
                        Transcribe Audio
                      </div>
                    )}
                  </Button>

                  {errorMessage && (
                    <Alert variant='destructive'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
