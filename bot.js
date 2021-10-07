//tmi.js é utilizado para conectar com o IRC do Twitch
const tmi = require('tmi.js');
const dotenv = require('dotenv').config();

if (dotenv.error) { throw result.error }

//opções do bot, login, token, canais para acessar, debug, ssl, reconnect
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
//Opções de Propaganda
const intervalo = parseInt(process.env.INTERVALO_PROPAGANDA) * 60000;
const duracao = parseInt(process.env.DURACAO_PROPAGANDA);

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

//============  Área para Timed Events ==================
var prop_interval = setInterval(propaganda, intervalo, opts.channels[1], duracao);
;

//handler de msgs
function onMessageHandler(channel, tags, msg, self){
    //ignora msgs vindas do próprio bot.
    if (self || !msg.startsWith('!')) {return;};
    
    //slice remove o primeiro elemento aka !
    //split gera um array de strings apartir do input msg, dividindo quando vê ' '
    msg = msg.trim();
    args = msg.slice(1).split(' ');
    //shift remove o primeiro elemento do array nesse caso ele remove o comando e coloca em command,
    //e os demais argumentos continuam em args.
    command = args.shift().toLowerCase();
    
    console.log(command);
    //Roll Dices
    if (command === 'dice') {
        dice(args.shift().toLowerCase(), args.shift().toLowerCase(), channel, tags);
    } else if (command === 'placeholder'){
        return
    }
    
};

//handler do evento de conexão
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
};

//função para rolagem de dados
function dice(lados, quantidade, channel, tags){
    try {
        lados = parseInt(lados);
        quantidade = parseInt(quantidade);
        if (quantidade > 20 || lados > 100) {
            client.say(channel, `@${tags.username}, щ（ﾟДﾟщ） eu só consigo rolar no máximo 20 dados de até 100 lados.`);
            return;
        }
        var resultado = [];
        for (let i = 0; i < quantidade; i++){
            resultado.push(Math.floor(Math.random() * lados) + 1);
        }
        client.say(channel, `@${tags.username}, você rolou: ${resultado.join(' - ')}`)
    } catch (e){
        client.say(channel, `@${tags.username}, : Erro nos argumentos. < !dice <lados> <quantidade> > Ex: "!dice 20 3", roda 3 d20.`)
    }
}

//função de propaganda
function propaganda(channel, duracao){
    client.commercial(channel, duracao)
.then((data) => {
    // data returns [channel, seconds]
    console.log(data);
}).catch((err) => {
    //promisse rejection catch
    console.log("error: ",err);
});
}