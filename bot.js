// =========== SETUP ENVIROMENT =========== 
const tmi = require('tmi.js');
const dotenv = require('dotenv').config();
const fs = require ('fs/promises');    

if (dotenv.error) { throw result.error }


// =========== VARIAVEIS E CONSTANTES =========== 
//opções do bot, login, token, canais para acessar, debug, ssl, reconnect
const opts = {
    //identity é a conta que bot usa e autorização
    options: { debug: false },
    connection: {
        secure: true,
        reconnect: true,
    },
    identity: {
        username: process.env.TWITCH_USER ,//BOT_USERNAME
        password: process.env.TWITCH_OAUTH_TOKEN,//OAUTH_TOKEN
    },
    //channels contem a lista de canais ao qual o bot está conectado
    channels: [
        'lieslieslies',
    ]
    };


//Opções de Propaganda
var play_propaganda = process.env.PLAY_PROPAGANDA;
const intervalo = parseInt(process.env.INTERVALO_PROPAGANDA) * 60000;
const duracao = parseInt(process.env.DURACAO_PROPAGANDA);

//Links Salvos
var links = {
    discord:    process.env.LINK_DISCORD,
    twitter:    process.env.LINK_TWITTER,
    youTube:    process.env.LINK_YOUTUBE,
    spellTable: process.env.LINK_SPELLTABLE,
    gartic:     process.env.LINK_GARTIC,
    jakbox:     process.env.LINK_JAKBOX,
    ark:        process.env.LINK_ARK,

};

// Lista de Comandos Válidos e lista de funções.
var COMANDOS = ['dice', 'stlink', 'links', 'help'];

//Log
//Lista de Unique user-id nessa seção.
var u_uid = [];
const log_path = process.env.LOG_PATH;


//==============================================

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

// ############# STARTUP #############
let date_ob = new Date();
let dia = ("0" + date_ob.getDate()).slice(-2);
let mes = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let ano = (date_ob.getFullYear());
let hora = ("0" + date_ob.getHours()).slice(-2);
let minuto = (date_ob.getMinutes());


let uid_file = (log_path + "/uid-" + dia + "-" + mes + "-" + ano + ".tsv");
let chat_file = (log_path + "/chat-" + dia + "-" + mes + "-" + ano + ".tsv");

start_log (uid_file, chat_file);



/* 
Ao conectar a stream o bot irá criar dois arquivos de Texto nos quais irá armazenar
os ids unicos de cada pessoa no chat, e no outro arquivo do log de cada msg do chat,
associado ao id unico da pessoa que mandou a msg.
*/

client.connect()
.then((data) => {
    // data returns [server, port]
}).catch((err) => {
    console.log('## CONNECTION ERROR ##');
    console.log(err);
});

client.join("lieslieslies")
.then((data) => {
    // data returns [channel]
}).catch((err) => {
    //
});


// ============  Área para Timed Events ==================
if (play_propaganda){
    setInterval(propaganda, intervalo, opts.channels[1], duracao); 
} 
// =======================================================

//handler do evento de conexão
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
};


//handler de msgs
function onMessageHandler(channel, tags, msg, self){    
    bool_to_save = true;
    temp_id = tags['user-id'];
    loop1:
    u_uid.forEach(element => {
        
        loop2:
        if (element === temp_id){
            bool_to_save = false;
            break loop2;
        }
    });
    
    if(bool_to_save){
        u_uid.push(temp_id);
        append_log_viewer(uid_file, tags);
    }

    if (!self){append_log_chat(chat_file, tags, msg);}
    
    if (self || !msg.startsWith('!')) {return;};
    
    args = msg.slice(1).split(' ');

    command = args.shift().toLowerCase();
    console.log(command);
    console.log(args);
    if (command === 'dice') {
        dice(args, channel, tags);
    } else if ((command === 'spelltable' || command === 'gartic' || command === 'jakbox' || command === 'ark')
            && tags.badges.broadcaster){
                setLink(args, channel, command);
    } else if (command === 'links'){
        showLinks(channel);
    } else if (command === 'help'){
        help(channel, tags);
    }
    else {
        client.say(channel, `@${tags.username} ¯\\_(⊙︿⊙)_/¯`);
    }
    
};




// ================ FUNÇOES ====================
//função para rolagem de dados
function dice(args, channel, tags){
    lados = 0;
    quantidade = 0;
    
    try{
        //tratamento de input
        lados = parseInt(args.shift().toLowerCase());
        quantidade =  parseInt(args.shift().toLowerCase());
        //lógica dos dados
        if (quantidade > 20 || lados > 100) {
            client.say(channel, `@${tags.username}, щ（ﾟДﾟщ） eu só consigo rolar no máximo 20 dados de até 100 lados.`);
            return;
        }
        var resultado = [];
        for (let i = 0; i < quantidade; i++){
            resultado.push(Math.floor(Math.random() * lados) + 1);
        }
        client.say(channel, `@${tags.username}, você rolou: ${resultado.join(' - ')}`)
    }catch(e) {
        client.say(channel, `@${tags.username}, : Erro nos argumentos. < !dice <lados> <quantidade> > Ex: "!dice 20 3", roda 3 d20.`);
    }
}

//função para definir links
function setLink(args, channel, command){
    try {
        links[command] = args.shift();
        client.say(channel, "link adicionado.");
        console.log(links);
    } catch (e){
        console.log("Error :", e);
    }
}

//função para mostrar links no chat
function showLinks(channel){
    try {
        for (var prop in links){
            if (!(links[prop] === "")){
                client.say(channel, `${prop}: ${links[prop]}`);
            }
        }  
    } catch (e){
        console.log("Error :", e);
    }
}

//função HELP
function help(channel, tags){
    client.say(channel, 
        `
        Commandos disponiveis: 
        !help -> lista comandos disponiveis ##
        !links -> mostra links sociais e para salas de jogos da stream ##
        !dice <l> <n> -> rola 'n' dados com 'l' lados ##
        `
        );
}
 
//função de propaganda
function propaganda(channel, duracao){
    client.commercial(channel, duracao)
.then((data) => {
    // data returns [channel, seconds]
    console.log(data);
}).catch((err) => {
    //promisse rejection catch
    console.log("error: ",err);});
}

//função para iniciar log da conversa
function start_log(uid_fn, chat_fn){
    try {
        viewer_formated = ("U_U_ID \t BADGES \t DISPLAY NAME \t MSG ID \t MOD \t ROOM ID \t SUBSCRIBER \t USERNAME \n");
        fs.appendFile(uid_fn, viewer_formated);
        fs.appendFile(chat_fn, "U_U_ID \t TIME STAMP \t CHAT MESSAGE \n");
    }catch(err){
        console.log(err);
    }
}

//função para salvar log da conversa
async function append_log_chat(chat_fn, tags, msg){
    try {
        chat_formated = (tags['user-id'] + "\t" + tags['tmi-sent-ts'] + "\t" + msg + "\n");
        await fs.appendFile(chat_fn, chat_formated);
    }catch(err){
        console.log(err);
    }
}

//função para salvar log de viewers
async function append_log_viewer(uid_fn, tags){
    try {
        viewer_formated = (`${tags['user-id']} \t ${tags['badges-raw']} \t ${tags['display-name']} \t ${tags.id} \t ${tags.mod} \t ${tags['room-id']} \t ${tags.subscriber} \t ${tags.username} \n`);
        await fs.appendFile(uid_fn, viewer_formated);
    }catch(err){
        console.log(err);
    }
}