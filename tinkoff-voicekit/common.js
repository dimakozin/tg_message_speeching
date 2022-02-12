const auth = require('./auth.js');
const protoLoader = require('@grpc/proto-loader');
const grpcLibrary = require('@grpc/grpc-js');

const packageDefinition = protoLoader.loadSync(
    [
        __dirname + '/apis/tinkoff/cloud/stt/v1/stt.proto',
        __dirname + '/apis/tinkoff/cloud/tts/v1/tts.proto',
        __dirname + '/apis/tinkoff/cloud/longrunning/v1/longrunning.proto',
        __dirname + '/third_party/googleapis/google/rpc/status.proto',
    ],
    {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

const ttsProto = grpcLibrary.loadPackageDefinition(packageDefinition).tinkoff.cloud.tts.v1;

function createAuthCredentials(credentials) {
    const channelCredentials = grpcLibrary.credentials.createSsl();
    const callCredentials = grpcLibrary.credentials.createFromMetadataGenerator(
        auth.jwtMetadataGenerator(
            credentials.apiKey, 
            credentials.secretKey, 
            credentials.issuer, 
            credentials.subject
        ));

    return grpcLibrary.credentials.combineChannelCredentials(channelCredentials, callCredentials);
}

function createTtsClient(credentials) {
    return new ttsProto.TextToSpeech("api.tinkoff.ai:443", createAuthCredentials(credentials));
}


module.exports = {
    createTtsClient
};
