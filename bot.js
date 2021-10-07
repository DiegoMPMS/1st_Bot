//tmi.js é utilizado para conectar com o IRC do Twitch
const tmi = require('tmi.js');
const dotenv = require('dotenv').config();

if (dotenv.error) { throw result.error }

const opts = {
    //identity é a conta que bot usa e autorização
    options: { debug: false },
    connection: {
        secure: true,
        reconnect: true,
    },
    identity: {
        username: 'b0tsb0tsb0ts' ,//BOT_USERNAME
        password: process.env.TWITCH_OAUTH_TOKEN,//OAUTH_TOKEN
    },
    //channels contem a lista de canais ao qual o bot está conectado
    channels: [
        'lieslieslies',
    ] 
};

//criar o client que usando as credenciais forncedas se conecta aos canais informados
const client = new tmi.client(opts);

//handlers que redirecionam eventos de recebimento de msg e conexão.
/* Explicando o tmi.client.on(evento, redirecionamento)
quando o 'evento' ocorre as informações do evento extraidas dele e repassadas para redirecionamento
que nesse caso é uma função, no caso de message as informações recebidas são (channel, tags, message, self) 
channel -> é o canal de chat a ser usado.
tags    -> tags do twitch no pradrão IRC, são comandos tipo ClearChat, PrivMsg, https://dev.twitch.tv/docs/irc/tags.
message -> é a mensagem como escrita no chat.
self    -> indica se quem escreveu a msg foi o bot, util para não ficar empacado lendo as próprias msgs.
*/
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

//tentar conexão
client.connect();

//handler de msgs
function onMessageHandler(channel, tags, msg, self){
    //ignora msgs vindas do próprio bot.
    if (self) {return;};
    //printa no console o nome da pessoa e a msg enviada por ela
    msg = msg.trim();
    msg = msg.toLowerCase();
    console.log(msg);
    if (msg === '!olabot') {
        client.say(channel, `@${tags.username}, Hello There.`)
    }

};

//handler do evento de conexão
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
};
