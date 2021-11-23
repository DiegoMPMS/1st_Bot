const {QtMainWindow} = require("@nodegui/nodegui");

const win = new QtMainWindow(); 

win.show();

global.win = win; 
/*
tornar a janela uma variavel global impede que ela seja removida pelo garbage colector
quando ela se tornar ociosa.
*/