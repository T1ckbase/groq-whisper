import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { CustomSelect, CustomSelectOption } from '@/components/ui/custom-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Upload, Key, Wand2 } from 'lucide-react';
import { languageMap } from './lib/languages';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';
import Github from './components/github-svg';

interface TranscriptionOutput {
  text: string;
  json: string;
  srt: string;
}

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
  const [model, setModel] = useState('whisper-large-v3');
  const [language, setLanguage] = useState('auto');
  const [wordTimestamps, setWordTimestamps] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [output, setOutput] = useState<TranscriptionOutput>({
    text: '',
    json: '',
    srt: '',
  });

  // useEffect(() => {
  //   const savedApiKey = localStorage.getItem('groqApiKey');
  //   if (savedApiKey) {
  //     setApiKey(savedApiKey);
  //   }
  // }, []);

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
      alert('Please select an audio file and provide an API key');
      return;
    }

    setIsTranscribing(true);

    try {
      // Simulated transcription response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const sampleText = 'This is a sample transcription.';
      const sampleJson = JSON.stringify(
        {
          text: sampleText,
          segments: [
            {
              start: 0,
              end: 2.5,
              text: 'This is',
            },
            {
              start: 2.5,
              end: 4.0,
              text: 'a sample transcription.',
            },
          ],
        },
        null,
        2,
      );

      const sampleSrt = `1
00:00:00,000 --> 00:00:02,500
This is

2
00:00:02,500 --> 00:00:04,000
a sample transcription.`;

      setOutput({
        text: sampleText,
        json: sampleJson,
        srt: sampleSrt,
      });
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDownload = (format: string) => {
    const content = 'Sample transcription content';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription.${format}`;
    a.click();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ThemeProvider defaultTheme='system' storageKey='theme'>
      <div className='bg-background text-foreground min-h-screen p-4 font-mono'>
        <div className='mx-auto max-w-7xl'>
          {/* <h1 className='mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-3xl font-bold text-transparent'>Groq Whisper</h1> */}
          <header className='border-border mb-4 flex items-center justify-between border-b pb-4'>
            <h1 className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent'>Groq Whisper</h1>
            <div className='flex items-center space-x-4'>
              <a href='https://github.com/T1ckbase/fast-translate' target='_blank' rel='noopener noreferrer'>
                <Github className='h-5 w-5' />
              </a>
              <div className='ml-auto'>
                <ModeToggle />
              </div>
            </div>
          </header>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Left Column - Transcription Output */}
            <div className='space-y-4'>
              <Card className='bg-card/50 border-muted p-4 backdrop-blur'>
                <Tabs defaultValue='text' className='w-full'>
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
                    <TabsContent key={format} value={format} className='space-y-4'>
                      <div className='relative'>
                        <Textarea value={output[format]} className='bg-muted/50 min-h-[500px] font-mono text-sm' placeholder={`Transcription will appear here in ${format.toUpperCase()} format`} readOnly />
                        <div className='absolute top-2 right-2 space-x-2'>
                          <Button variant='secondary' size='icon' onClick={() => handleCopy('')} disabled={!output[format]}>
                            <Copy className='h-4 w-4' />
                          </Button>
                          <Button variant='secondary' size='icon' onClick={() => handleDownload(format)} disabled={!output[format]}>
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            </div>

            {/* Right Column - Configuration */}
            <div className='space-y-4'>
              <Card className='bg-card/50 border-muted p-6 backdrop-blur'>
                <h2 className='text-xl font-bold'>Configuration</h2>

                <div className='space-y-6'>
                  {/* API Key Input */}
                  <div className='space-y-2'>
                    <Label>GROQ API Key</Label>
                    <div className='relative'>
                      <Input type='password' value={apiKey} onChange={(e) => setApiKey(e.target.value)} onBlur={(e) => handleApiKeyBlur(e.target.value)} className='bg-muted/50 pl-9' placeholder='Enter your GROQ API key' />
                      <Key className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>
                      Audio File <span className='opacity-40'>flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm supported</span>
                    </Label>
                    <div className='flex items-center gap-4'>
                      <Input type='file' accept='.flac,.mp3,.mp4,.mpeg,.mpga,.m4a,.ogg,.wav,.webm' className='bg-muted/50' onChange={handleFileChange} />
                      {/* <Button variant='secondary' size='icon'>
                        <Upload className='h-4 w-4' />
                      </Button> */}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className='bg-muted/50'>
                        <SelectValue placeholder='Select model' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='whisper-large-v3'>Whisper large-v3</SelectItem>
                        <SelectItem value='whisper-large-v3-turbo'>Whisper Large V3 Turbo</SelectItem>
                        <SelectItem value='distil-whisper-large-v3-en'>Distil-Whisper English</SelectItem>
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
                        <SelectItem value='auto'>Auto detect</SelectItem>
                        {Object.entries(languageMap).map(([k, v]) => (
                          <SelectItem value={v}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex items-center justify-between'>
                    <Label htmlFor='word-level-timestamps'>Word-level timestamps</Label>
                    <Switch checked={wordTimestamps} onCheckedChange={setWordTimestamps} />
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
