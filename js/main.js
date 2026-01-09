/**
 * Desenvolvido por:
 *
 * Leandro Ricardo Neumann - lrneumann@hotmail.com
 * Eduardo Ivan Beckemkamp - ebeckemkamp@gmail.com
 * Jonathan Ramon Peixoto - johnniepeixoto@gmail.com
 * Luiz Gustavo Rupp - luizrupp@hotmail.com
 *
 * 04 de dezembro de 2012
 */
Array.prototype.contains = function (object) {
	for (i = 0; i < this.length; i++) {
		if (this[i] == object) {
			return i;
		}
	}
	return -1;
};

Array.prototype.add = function (object) {
	if (object === null && this.contains(object) >= 0) {
		return false;
	}
	else {
		this[this.length] = object;
		return true;
	}
};

Array.prototype.remove = function (from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

Array.prototype.isEmpty = function () {
	if (this == null || this.length == 0) {
		return true;
	}
	else {
		return false;
	}
};

function isInCircle(x, y, center_x, center_y, radius) {
	return (Math.pow(x - center_x, 2) + Math.pow(y - center_y, 2) < radius * radius)
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}


var sequence = 0;
var raiz;
var nodos = new Array();
var canvas;
var context;
var tela;
var divOpcoes;
var divOpcoesAberta = false;
var clickLiberado = false;
var selectedNode = null;

var execucao = new Array();
var focoExecucao = new Array();

function init() {
	// cria tela
	tela = new Tela(1000, 600);

	// cria nodo raiz
	raiz = new Nodo();
	raiz.x = (tela.largura - larguraNodo) / 2;
	raiz.y = 50;
	raiz.nivel = 0;
	raiz.y = raiz.nivel * (alturaNodo + espacoNivel) + 50;

	// adiciona raiz à lista de nodos
	nodos.add(raiz);

	divOpcoes = document.createElement('div');
	divOpcoes.id = "divOpcoes";

	// sei la o q ... canvas
	canvas = document.getElementById('drawing');
	context = canvas.getContext('2d');

	canvas.addEventListener('mousedown', ckmouse, false);

	// desenha a tela
	tela.draw();
}

function ckmouse(e) {
	if (e.target.tagName !== 'CANVAS') return; // Safety check

	var nodo = null;
	for (var i = 0; i < nodos.length; i++) {
		if (isInCircle(e.offsetX, e.offsetY, nodos[i].x, nodos[i].y, larguraNodo / 2)) {
			nodo = nodos[i];
			break;
		}
	}

	// Select or Deselect
	selectedNode = nodo;
	tela.draw();
}


function Nodo() {
	this.pk;
	this.valor = null;
	this.quebra = false;
	this.pai = null;
	this.filhos = new Array();
	this.podaIneficaz = false;
	this.explorado = false;

	this.x;
	this.y;
	this.nivel;

	this.draw = drawNodo;

	obterPK(this);
}

function obterPK(objeto) {
	objeto.pk = ++sequence;
}

function findByPK(pk) {
	for (var i = 0; i < nodos.length; i++) {
		if (nodos[i].pk == pk) {
			return nodos[i];
		}
	}
	return null;
}

function adicionarFilho(pkPai) {
	var pai = findByPK(pkPai);
	if (pai == null) {
		// TODO erro
		alert("Erro");
		return false;
	}
	var nodo = new Nodo();
	nodo.pai = pai;
	pai.filhos.add(nodo);
	nodos.add(nodo);
	nodo.nivel = pai.nivel + 1;
	nodo.y = nodo.nivel * (alturaNodo + espacoNivel) + 50;
	pai.valor = null;

	var t = document.getElementById('drawing')
	var height = t.height;
	var temp = nodo.y;
	if (nodo.nivel > 7) {
		if ((temp + 50) > height) {
			t.height = temp + 50;
			tela.altura = temp + 50;
		}
	}

	tela.draw();
}

function reorganiza(nodo) {
	if (nodo.pk != raiz.pk) {
		pai = nodo.pai;
		// se for filho unico, x = x do pai
		if (pai.filhos.length == 1) {
			nodo.x = pai.x;
		} else {

			var posInicial = 0;
			var quant = pai.filhos.length;
			var larg = (pai.x + larguraNodo / 2) * 2;

			// se não for raiz
			if (pai.pk != 1) {
				var paiCalculo = pai;
				while (paiCalculo.pai.filhos.length < 2 && paiCalculo.pai.pai != null) {
					paiCalculo = paiCalculo.pai;
				}

				var pos = paiCalculo.pai.filhos.contains(paiCalculo);
				if (pos == 0) {
					if (paiCalculo.pai.filhos.length > 1) {
						var paiAnt = paiCalculo.pai.filhos[pos + 1];
						larg = paiAnt.x - paiCalculo.x;
						posInicial = paiCalculo.x - larg / 2 + larguraNodo;
						larg -= larguraNodo;
					}
				} else {
					var paiAnt = paiCalculo.pai.filhos[pos - 1];
					larg = paiCalculo.x - paiAnt.x;
					posInicial = larg / 2 + larguraNodo + paiAnt.x;
					larg -= larguraNodo;
				}
			}

			var largNodo = larg / quant; // se menor q 50, n deixa add
			var nodoX = largNodo / 2 - larguraNodo / 2;
			var acum = posInicial;
			for (var i = 0; i < quant; i++) {
				pai.filhos[i].x = acum + nodoX;
				acum += largNodo;
			}
		}
	}

	if (!nodo.filhos.isEmpty()) {
		for (var i = 0; i < nodo.filhos.length; i++) {
			reorganiza(nodo.filhos[i]);
		}
	}
}

function calculoPosPai(nivelAtual) {
	// varre todos os nodos
	for (var i = 0; i < nodos.length; i++) {
		var nodo = nodos[i];
		// se nivel certo e 'x' ainda não definido
		if (nodo.nivel == nivelAtual - 1 && nodo.x == null) {
			var quantFilhos = nodo.filhos.length;
			var menorX = nodo.filhos[0].x;
			var maiorX = nodo.filhos[quantFilhos - 1].x;

			nodo.x = (menorX + maiorX) / 2;
		}
	}
}

function reposicionaFolhas(nodo, folhaAtual, larguraPorNodo) {
	if (nodo.filhos.isEmpty()) {
		nodo.x = folhaAtual * larguraPorNodo + larguraPorNodo / 2;
		folhaAtual++;
	} else {
		for (var i = 0; i < nodo.filhos.length; i++) {
			folhaAtual = reposicionaFolhas(nodo.filhos[i], folhaAtual, larguraPorNodo);
		}
	}

	return folhaAtual;
}

function reorganizaNew() {
	// limpa o x de todos os nodos
	for (var i = 0; i < nodos.length; i++) {
		nodos[i].x = null;
	}

	// obtem quantidade de folhas e maior nivel
	var quantFolhas = 0;
	var maiorNivel = 0;
	for (var i = 0; i < nodos.length; i++) {
		var nodo = nodos[i];
		if (nodo.filhos.isEmpty()) {
			quantFolhas++;
			if (nodo.nivel > maiorNivel) {
				maiorNivel = nodo.nivel;
			}
		}
	}

	// calcula largura disponível para cada folha
	var larguraPorNodo = tela.largura / quantFolhas;

	// coloca as folhas no lugar
	reposicionaFolhas(raiz, 0, larguraPorNodo);

	nivelAtual = maiorNivel;
	while (nivelAtual > 0) {
		calculoPosPai(nivelAtual);
		nivelAtual--;
	}
}

function editar(pkNodo) {
	var nodo = findByPK(pkNodo);
	if (nodo == null) {
		alert("Node does not exist.");
		return false;
	}
	var valor = prompt("Type a number:");

	if (!isNumber(valor)) {
		alert("That is not a number.");
		return;
	}
	nodo.valor = valor;

	tela.draw();
}

function folhasPreenchidas() {
	for (var i = 0; i < nodos.length; i++) {
		var nodo = nodos[i];
		if (nodo.filhos.isEmpty() && nodo.valor == null) {
			alert("You have to set value to all leaf nodes.");
			return false;
		}
	}
	return true;
}

function excluirNodo(pkNodo, alertar) {
	if (pkNodo == 1) {
		alert("You can't delete the root node.")
		return;
	}

	var nodo = findByPK(pkNodo);
	if (nodo == null) {
		alert("Node doesn't exist.");
		return false;
	}

	if (!nodo.filhos.isEmpty()) {
		var resposta = true;
		if (alertar) {
			resposta = confirm("This node has children. Do you want to kill his kids? :'(");
		}
		if (resposta) {
			while (nodo.filhos.length > 0) {
				excluirNodo(nodo.filhos[0].pk, false);
			}
			//for (var i = 0; i < nodo.filhos.length; i++) {

			//}
		} else {
			return;
		}
	}

	if (nodo.pai != null) {
		var pos = nodo.pai.filhos.contains(nodo);
		nodo.pai.filhos.remove(pos);
	}

	var pos = nodos.contains(nodo);
	nodos.remove(pos);

	if (alertar) {
		tela.draw();
	}
}

var execucaoPassoAtual = 0;
function executarPassoAnterior() {
	if (execucaoPassoAtual > 0) {
		execucaoPassoAtual--;
	}
	tela.draw(execucao[execucaoPassoAtual]);
	focoExecucao[execucaoPassoAtual].draw("red");
}

function executarProximoPasso() {
	if (execucaoPassoAtual < execucao.length - 1) {
		execucaoPassoAtual++;
	}
	tela.draw(execucao[execucaoPassoAtual]);
	focoExecucao[execucaoPassoAtual].draw("red");
}

function executarFinal() {
	tela.draw();
}

function finalizarExecucao() {
	tela.draw();

	execucaoPassoAtual = 0;
	execucao = new Array();
	focoExecucao = new Array();

	$("#menu_execucao").hide();
	$("#menu_principal").show();
}

function limpaValoresEQuebras() {
	for (var i = 0; i < nodos.length; i++) {
		nodos[i].quebra = false;
		nodos[i].podaIneficaz = false;
		nodos[i].explorado = false;
		if (!nodos[i].filhos.isEmpty()) {
			nodos[i].valor = null;
		}
	}

	tela.draw();
}

function clonaNodo(nodo, newPai) {
	var n = new Nodo();
	//n.pk = nodo.pk;
	n.valor = nodo.valor;
	n.quebra = nodo.quebra;
	n.podaIneficaz = nodo.podaIneficaz;
	n.explorado = nodo.explorado;
	n.pai = newPai;
	n.filhos = new Array();
	for (var i = 0; i < nodo.filhos.length; i++) {
		n.filhos.add(nodo.filhos[i]);
	}

	n.x = nodo.x;
	n.y = nodo.y;
	n.nivel = nodo.nivel;

	return n;
}

function clonaRecursivo(nodo, estado, nodoAtual) {
	if (nodo.filhos.isEmpty()) {
		return;
	} else {
		for (var i = 0; i < nodo.filhos.length; i++) {
			var novoNodo = clonaNodo(nodo.filhos[i], nodo);
			estado.add(novoNodo);
			clonaRecursivo(novoNodo, estado, nodoAtual);

			if (nodoAtual == nodo.filhos[i]) {
				focoExecucao.add(novoNodo);
			}

			nodo.filhos[i] = novoNodo;
		}
	}
}

function getEstadoAtual(nodoAtual) {
	var newRaiz = clonaNodo(raiz, null);

	var estAtual = new Array();
	estAtual.add(newRaiz);

	if (nodoAtual == raiz) {
		focoExecucao.add(newRaiz);
	}

	clonaRecursivo(newRaiz, estAtual, nodoAtual);

	return estAtual;
}

function criaMiniMax() {
	if (folhasPreenchidas()) {
		limpaValoresEQuebras();
		execucao = new Array();
		focoExecucao = new Array();
		execucaoPassoAtual = 0;
		minimax(raiz);
		$("#menu_execucao").show();
		$("#menu_principal").hide();
	}
}

function minimax(nodo) {
	nodo.explorado = true;
	execucao.add(getEstadoAtual(nodo));

	if (!nodo.filhos.isEmpty()) {
		for (var i = 0; i < nodo.filhos.length; i++) {
			console.log("nodo => " + nodo.filhos[i].pk);
			minimax(nodo.filhos[i]);
		}
	}
	if (nodo == raiz) {
		return;
	}
	if (nodo.pai.valor == null) {
		nodo.pai.valor = nodo.valor;
	} else {
		var max = false;
		if (nodo.nivel % 2 == 0) {
			max = true;
		}
		var valorNodo = Math.floor(nodo.valor);
		var valorPai = Math.floor(nodo.pai.valor);
		if (max) {
			if (valorNodo < valorPai) {
				nodo.pai.valor = nodo.valor;
			}
		} else {
			if (valorNodo > valorPai) {
				nodo.pai.valor = nodo.valor;
			}
		}
	}
	execucao.add(getEstadoAtual(nodo));
	focoExecucao[focoExecucao.length - 1] = focoExecucao[focoExecucao.length - 1].pai;
}

function criaPoda() {
	if (folhasPreenchidas()) {
		limpaValoresEQuebras();
		execucao = new Array();
		focoExecucao = new Array();
		execucaoPassoAtual = 0;
		poda(raiz);
		$("#menu_execucao").show();
		$("#menu_principal").hide();
	}
}

function poda(nodo) {
	nodo.explorado = true;
	execucao.add(getEstadoAtual(nodo));
	if (!nodo.filhos.isEmpty()) {
		var quebra = false;
		for (var i = 0; i < nodo.filhos.length; i++) {
			console.log("nodo => " + nodo.filhos[i].pk);

			if (!quebra) {
				quebra = poda(nodo.filhos[i]);
				if (quebra && i == nodo.filhos.length - 1) {
					nodo.podaIneficaz = true;
				}
			} else {
				nodo.filhos[i].quebra = true;
			}
		}
	}
	if (nodo == raiz) {
		return false;
	}

	var max = false;
	if (nodo.nivel % 2 == 0) {
		max = true;
	}

	if (nodo.pai.valor == null) {
		nodo.pai.valor = nodo.valor;
	} else {
		var valorNodo = Math.floor(nodo.valor);
		var valorPai = Math.floor(nodo.pai.valor);
		if (max) {
			if (valorNodo < valorPai) {
				nodo.pai.valor = nodo.valor;
			}
		} else {
			if (valorNodo > valorPai) {
				nodo.pai.valor = nodo.valor;
			}
		}
	}
	execucao.add(getEstadoAtual(nodo));
	focoExecucao[focoExecucao.length - 1] = focoExecucao[focoExecucao.length - 1].pai;

	return testaPodaPai(nodo, max);
}

function testaPodaPai(nodo, max) {

	if (nodo.pai == null) {
		return;
	}

	var valor = nodo.pai.valor;
	var quebra = false;

	var nodoAux = nodo.pai.pai;
	while (nodoAux != null) {
		if ((nodoAux.nivel % 2 == 0) == max) {
			if (nodoAux.valor != null) {
				if (max) {
					if (Math.floor(valor) <= Math.floor(nodoAux.valor)) {
						quebra = true;
						break;
					}
				} else {
					if (Math.floor(valor) >= Math.floor(nodoAux.valor)) {
						quebra = true;
						break;
					}
				}
			}
		}
		nodoAux = nodoAux.pai;
	}

	if (quebra) {
		console.log(nodo.valor + " | " + nodo.nivel);
		return true;
	}

	return false;
}

function Tela(largura, altura) {
	this.largura = largura;
	this.altura = altura;

	this.draw = drawTela;
}

function drawTela(nodoList) {
	if (!nodoList) {
		nodoList = nodos;
	}

	reorganizaNew(raiz);

	context.beginPath();

	context.fillStyle = "white";
	context.fillRect(0, 0, this.largura, this.altura);
	context.closePath();

	maxNivel = 0;
	for (var i = 0; i < nodoList.length; i++) {
		if (nodoList[i].nivel > maxNivel) {
			maxNivel = nodoList[i].nivel;
		}
	}


	for (var i = 0; i < nodoList.length; i++) {
		if (nodoList[i].pai != null) {
			context.beginPath();
			context.strokeStyle = "black";
			if (nodoList[i].explorado) {
				context.lineWidth = 3;
			} else {
				context.lineWidth = 1;
			}
			context.moveTo(nodoList[i].x, nodoList[i].y);
			context.lineTo(nodoList[i].pai.x, nodoList[i].pai.y);
			context.stroke();
			context.closePath();

			// se nodo possui quebra, desenha o simbolo correspondente
			if (nodoList[i].quebra) {
				context.beginPath();
				context.strokeStyle = "red";
				var centroX = (Math.floor(nodoList[i].x) + Math.floor(nodoList[i].pai.x)) / 2;
				var centroY = (Math.floor(nodoList[i].y) + Math.floor(nodoList[i].pai.y)) / 2;

				var parentIsMax = (nodoList[i].pai.nivel % 2 == 0);

				if (parentIsMax) {
					// Parent is MAX -> Beta Cut -> Draw '+'
					context.moveTo(centroX, centroY - 12);
					context.lineTo(centroX, centroY + 12);
					context.moveTo(centroX - 12, centroY);
					context.lineTo(centroX + 12, centroY);
				} else {
					// Parent is MIN -> Alpha Cut -> Draw 'X'
					context.moveTo(centroX - 10, centroY - 10);
					context.lineTo(centroX + 10, centroY + 10);
					context.moveTo(centroX - 10, centroY + 10);
					context.lineTo(centroX + 10, centroY - 10);
				}
				context.lineWidth = 5; // Bolder lines for symbols
				context.stroke();
				context.lineWidth = 1; // Reset
				context.closePath();
			}

			//context.moveTo(nodoList[i].x + larguraNodo/2,100);
			//context.lineTo(200,200);
		}
	}

	for (var i = 0; i < nodoList.length; i++) {
		nodoList[i].draw();
	}


	for (var i = 0; i <= maxNivel; i++) {
		context.fillStyle = "rgba(200,200,200, 0.4)";
		context.strokeStyle = "rgba(200,200,200, 0.4);"
		context.font = "bold 22px 'Arial'";

		var str = new String(this.valor);

		context.fillText((i % 2 ? "MIN" : "MAX"), 30, (espacoNivel + alturaNodo) + i * (espacoNivel + alturaNodo) - 17);
		context.fillText((i % 2 ? " MIN" : "MAX"), 926, (espacoNivel + alturaNodo) + i * (espacoNivel + alturaNodo) - 17);

		context.moveTo(30, (espacoNivel + alturaNodo) + i * (espacoNivel + alturaNodo) + 15);
		context.lineTo(970, (espacoNivel + alturaNodo) + i * (espacoNivel + alturaNodo) + 15);
		context.stroke();

	}
}

function drawNodo(color) {
	if (!color) {
		color = "black"
		fillstyle = "white";
		firstfill = "rgb(160,160,160)";
	} else {
		fillstyle = "rgb(240,240,240)";
		firstfill = color;
	}

	if (this.podaIneficaz) {
		color = "orange"; // Highlight for ineffective pruning
		context.lineWidth = 6;
	} else {
		context.lineWidth = 1;
	}

	context.fillStyle = firstfill;
	context.strokeStyle = color;
	var y = this.nivel * (alturaNodo + espacoNivel) + 50;
	context.beginPath();
	context.arc(this.x, this.y, alturaNodo / 2 + 2, 0, 2 * Math.PI, false);
	context.fill();
	context.closePath();

	// Highlight Selected Node
	if (this == selectedNode) {
		context.beginPath();
		context.strokeStyle = "cyan";
		context.lineWidth = 4;
		context.arc(this.x, this.y, alturaNodo / 2 + 6, 0, 2 * Math.PI, false);
		context.stroke();
		context.closePath();
		context.lineWidth = 1; // reset
	}

	context.fillStyle = fillstyle;
	context.beginPath();
	//context.strokeRect(this.x, y, larguraNodo, alturaNodo);
	context.arc(this.x, this.y, alturaNodo / 2, 0, 2 * Math.PI, false);
	context.stroke();
	context.fill();
	context.closePath();

	if (this.valor != null) {
		context.fillStyle = "blue";
		context.font = "bold 13px 'Courier New'";

		var str = new String(this.valor);
		var pxLetra = 8;
		var larg = pxLetra * str.length;

		context.fillText(this.valor, this.x - larg / 2, this.y + 4);
	}
}

function excluirTudo() {
	limpaValoresEQuebras();
	nodos.remove(1, nodos.length - 1);
	nodos[0].x = (tela.largura - larguraNodo) / 2;
	nodos[0].valor = null;
	nodos[0].filhos = new Array();
	sequence = 1;
	var execucao = new Array();
	var focoExecucao = new Array();
	execucaoPassoAtual = 0;
	$("#menu_principal").show();
	$("#menu_execucao").hide();
	tela.draw();
}

$("document").ready(function () {

	init();

	$("button").button();


	$(function () {
		$("#dialog-sobre").dialog({
			autoOpen: false,
			width: 420,
			height: 290,
			modal: true,
			resizable: false,
			show: "slide",
			hide: "explode"
		});
	});

	$(document).keydown(function (e) {
		var key = e.which;
		if ($("#menu_execucao").css('display') != "none") {
			if (key == 37) {
				executarPassoAnterior();
			} else if (key == 39) {
				executarProximoPasso();
			}
		}
	});

});

function gerarExemplo() {
	excluirTudo();

	adicionarFilho(1);
	adicionarFilho(1);
	adicionarFilho(1);

	adicionarFilho(2);
	adicionarFilho(2);
	adicionarFilho(3);
	adicionarFilho(3);
	adicionarFilho(3);
	adicionarFilho(4);
	adicionarFilho(4);
	adicionarFilho(4);

	adicionarFilho(5);
	adicionarFilho(5);
	adicionarFilho(5);

	adicionarFilho(6);
	adicionarFilho(6);

	adicionarFilho(7);
	adicionarFilho(7);

	adicionarFilho(8);
	adicionarFilho(8);

	adicionarFilho(9);
	adicionarFilho(9);

	adicionarFilho(10);
	adicionarFilho(10);

	adicionarFilho(11);
	adicionarFilho(11);
	adicionarFilho(11);

	adicionarFilho(12);
	adicionarFilho(12);
	adicionarFilho(12);

	nodos[12].valor = -1;
	nodos[13].valor = -3;
	nodos[14].valor = -2;
	nodos[15].valor = -2;
	nodos[16].valor = 1;
	nodos[17].valor = 1;
	nodos[18].valor = 3;
	nodos[19].valor = 4;
	nodos[20].valor = 1;
	nodos[21].valor = 1;
	nodos[22].valor = 2;
	nodos[23].valor = -1;
	nodos[24].valor = 1;
	nodos[25].valor = 0;
	nodos[26].valor = 1;
	nodos[27].valor = 3;
	nodos[28].valor = 2;
	nodos[29].valor = -1;
	nodos[30].valor = -4;

	tela.draw();
}


var larguraNodo = 25;
var alturaNodo = 25;
var espacoNivel = 50

// TODO (ou não) arrastar bolinhas

function definirValoresLista() {
	showModal("Set Values (List)", "<p>Enter values separated by space, comma or semicolon:</p><input type='text' id='list-input' style='width: 100%; box-sizing: border-box;'>", function () {
		var lista = document.getElementById('list-input').value;
		if (!lista) return;

		var valores = lista.split(/[\s,;]+/);

		// Better approach: traverse tree DFS to find leaves in order.
		var leaves = [];
		function collectLeaves(nodo) {
			if (nodo.filhos.isEmpty()) {
				leaves.push(nodo);
			} else {
				for (var i = 0; i < nodo.filhos.length; i++) {
					collectLeaves(nodo.filhos[i]);
				}
			}
		}
		collectLeaves(raiz);


		for (var i = 0; i < leaves.length && i < valores.length; i++) {
			var val = parseFloat(valores[i]);
			if (!isNaN(val)) {
				leaves[i].valor = val;
			}
		}
		tela.draw();
	});
}

/** UI Helper Functions & Modal System */

function uiReset() {
	selectedNode = null;
	excluirTudo();
}

function uiAddFilho(n) {
	if (!selectedNode) {
		showModal("Error", "Select a node first!", null);
		return;
	}
	for (var i = 0; i < n; i++) {
		adicionarFilho(selectedNode.pk);
	}
}

function uiSetValor() {
	if (!selectedNode) {
		showModal("Error", "Select a node first!", null);
		return;
	}
	if (!selectedNode.filhos.isEmpty()) {
		showModal("Error", "Only leaf nodes can have values!", null);
		return;
	}

	showModal("Set Value", "<input type='number' id='node-val-input' value='" + (selectedNode.valor || "") + "'>", function () {
		var val = document.getElementById('node-val-input').value;
		if (isNumber(val)) {
			selectedNode.valor = val;
			tela.draw();
		} else {
			showModal("Error", "Invalid Number", null);
		}
	});
}

function uiRemoveNode() {
	if (!selectedNode) return;
	if (selectedNode == raiz) {
		showModal("Error", "Cannot remove root", null);
		return;
	}

	// Using existing excluding logic but wrapped to confirm
	showModal("Confirm Deletion", "Are you sure you want to delete this node and its children?", function () {
		excluirNodo(selectedNode.pk, false); // false to suppress internal confirm
		selectedNode = null;
		tela.draw();
	});
}


/* Modal System */
function showModal(title, htmlContent, onConfirm) {
	$("#modal-title").text(title);
	$("#modal-content").html(htmlContent);
	$("#modal-overlay").css("display", "flex");

	// Unbind previous events to avoid stacking
	$("#modal-confirm").off("click").on("click", function () {
		if (onConfirm) onConfirm();
		closeModal();
	});
}

function closeModal() {
	$("#modal-overlay").hide();
}