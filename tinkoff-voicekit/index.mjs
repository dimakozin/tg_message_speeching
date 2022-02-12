import stream from 'stream'
import wav from 'wav'

import {createTtsClient} from './common.js'

export default {
    textToSpeechSynthesize : (params, credentials) => {
        const ttsClient = createTtsClient(credentials);
        const ttsStreamingCall = ttsClient.StreamingSynthesize({
            input: {text: params.text},
            audioConfig: {
                audioEncoding: "LINEAR16",
                sampleRateHertz: params.sampleRate,
            },
            voice: {
                name: params.voice
            }
        });
    
        ttsStreamingCall.on('metadata', (metadata) => console.log("Initial response metadata", metadata));
        ttsStreamingCall.on('status', (status) => {
            console.log("Call ended, status", status);
            ttsClient.close();
        });
        ttsStreamingCall.on('error', (error) => console.error("Error", error));
        let startedStreaming = false;
        ttsStreamingCall.on('data', () => {
            if (!startedStreaming) {
                console.log("Started streaming back audio chunks");
                startedStreaming = true;
            }
        });
           
        const transformStream = new stream.Transform({
            writableObjectMode: true,
            transform(chunk, encoding, callback) {
                let pcm_data;
                pcm_data = chunk.audioChunk;
                callback(null, pcm_data);
            }
        });
    
        const wavFileWriter = new wav.FileWriter(params.fileName, {
            channels: 1,
            sampleRate: params.sampleRate,
            bitDepth: 16,
        });
        ttsStreamingCall.pipe(transformStream).pipe(wavFileWriter);

        return true;
    }
}