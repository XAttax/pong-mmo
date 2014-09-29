/* Connexion à socket.io */
var socket = io.connect('http://localhost:1337');
/* */

// On récupère l'ID du jeu en cours
var jeu_id = (document.URL).split('/');
jeu_id = jeu_id[jeu_id.length-1];

var URL = document.URL;

// On change la couleur du fond
document.getElementsByTagName('body')[0].style.backgroundColor = '#fff';

// Définition de l'élément Canvas
var canvas = document.getElementById('jeu');
var contexte = canvas.getContext('2d');

/* Liste des variables de jeu */
var ecranLargeur = 0; // Valeur par défaut
var ecranHauteur = 0; // Valeur par défaut
var canvasEchelle = 200/100; // 200px pour 100% de taille

var divDroite = document.getElementById('droite');
var divJoueurs = document.getElementById('joueurs');

var couleurBalle = '#ffffff';
var couleurJoueur1 = '#2980b9';
var couleurJoueur2 = '#27ae60';
var couleurJoueur3 = '#c0392b';
var couleurJoueur4 = '#f1c40f';

var erreur = {
	PARTIE_INCORRECT: 0,
	PARTIE_COMPLETE: 1,
	PARTIE_ENCOURS: 2
};

var key = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39
};

var m_pseudo = 'Player' + Math.round(Math.random()*1000); // Pseudo par défaut
var m_num = 0; // Rang par défaut (joueur1, joueur2, joueur3 ou joueur4)
var m_down = false; // True si on est en train d'appuyer sur une touche, false sinon

var gameInfos = {}; // Informations de la partie en cours

var decompteSec
var decompteInt = null;
/* */

/* Liste des fonctions nécessaire au fonctionnement du jeu */

/**
* Fonction appellé quand la taille de l'écran change (quand la fenetre est redimensionné)
**/
resizeEcran = function() {
	ecranLargeur = window.innerWidth;
	ecranHauteur = window.innerHeight;
	canvasEchelle = ecranHauteur/100;

	canvas.width = (100*canvasEchelle);
	canvas.height = (100*canvasEchelle);

	divDroite.style.width = (ecranLargeur-100*canvasEchelle) + 'px';
	divDroite.style.height = ecranHauteur + 'px';

	document.getElementById('formTchat').style.width = (ecranLargeur-100*canvasEchelle-7-7) + 'px';
	document.getElementById('listeMessages').style.maxHeight = (ecranHauteur-40-divJoueurs.offsetHeight) + 'px';
};

/**
* Fonction appellé quand on souhaite publié un message sur le tchat
**/
postTchat = function(texte) {
	document.getElementById('listeMessages').innerHTML = document.getElementById('listeMessages').innerHTML + '<div class="message">' + texte + '</div>';

	document.getElementById('listeMessages').scrollTop = document.getElementById('listeMessages').scrollHeight;

	document.getElementById('sonTchat').play();
};

/**
* Fonction appellé quand on souhaite se déplacer
**/
mouvement = function(sens, num) {
	// -2 = Stop haut ou gauche
	// -1 = Stop bas ou droite
	// 0 = Haut ou Gauche
	// 1 = Bas ou Droite

	if(sens == '-2') {
		gameInfos['joueur' + num].reculer = false;
	}
	else if(sens == '-1') {
		gameInfos['joueur' + num].avancer = false;
	}
	else if(sens == '0') {
		gameInfos['joueur' + num].reculer = true;
	}
	else if(sens == '1') {
		gameInfos['joueur' + num].avancer = true;
	}
};

/**
* Fonction permettant de convertir des degrés en radians
**/
deg2rad = function(degree) {
	return (degree/180) * Math.PI;
};

/**
* Fonction permettant de convertir des randians en degrés
**/
rad2deg = function(radian) {
	return (radian / Math.PI) * 180;
};

/**
* Ajouter une point à un joueur
**/
ajouterPoint = function(num) {
	gameInfos['joueur' + num].points++;

	if(gameInfos['joueur' + num].points < 0)
		texteScore = '<span style="color:#c0392b">' + gameInfos['joueur' + num].points + ' pt</span>';
	else if(gameInfos['joueur' + num].points == 0)
		texteScore = gameInfos['joueur' + num].points + ' pt';
	else
		texteScore = gameInfos['joueur' + num].points + ' pts';

	document.getElementById('joueur' + num + 'Score').innerHTML = texteScore;
};

/**
* Retirer un point à un joueur
**/
retirerPoint = function(num) {
	gameInfos['joueur' + num].points--;

	if(gameInfos['joueur' + num].points < 0)
		texteScore = '<span style="color:#c0392b">' + gameInfos['joueur' + num].points + ' pt</span>';
	else if(gameInfos['joueur' + num].points == 0)
		texteScore = gameInfos['joueur' + num].points + ' pt';
	else
		texteScore = gameInfos['joueur' + num].points + ' pts';

	document.getElementById('joueur' + num + 'Score').innerHTML = texteScore;
};
/* */

window.addEventListener('resize', resizeEcran);
resizeEcran(); // On appel la fonction pour redimensionner correctement le Canvas

document.getElementById('joueur1Couleur').style.background = couleurJoueur1;
document.getElementById('joueur2Couleur').style.background = couleurJoueur2;
document.getElementById('joueur3Couleur').style.background = couleurJoueur3;
document.getElementById('joueur4Couleur').style.background = couleurJoueur4;

m_pseudo = prompt('Entrez votre pseudo :', m_pseudo); // On demande le pseudo du joueur
while(m_pseudo == '')
	m_pseudo = prompt('Entrez votre pseudo :', m_pseudo);
if(m_pseudo == null)
	document.location.href = URL.substr(0, URL.length-7);

// On envoie le pseudo au serveur qui va traiter la place du joueur dans le jeu
socket.emit('connexionQ', { jeu_id: jeu_id, pseudo: m_pseudo });
// On attend la réponse sur serveur
socket.on('connexionR', function(donnees) {
	// Si la partie n'a jamais été créé
	if(donnees == erreur.PARTIE_INCORRECT) {
		alert('L\'id de la partie n\'existe pas !');
		document.location.href = URL.substr(0, URL.length-7);
	}
	else if(donnees == erreur.PARTIE_COMPLETE) {
		alert('Cette partie est malheuresement complète !');
		document.location.href = URL.substr(0, URL.length-7);
	}
	else if(donnees == erreur.PARTIE_ENCOURS) {
		alert('Cette partie est déjà commencé !');
		document.location.href = URL.substr(0, URL.length-7);
	}
	else {
		// On récupére le nombre de seconde restante avant le début de la partie
		if(donnees.secondesRestantes) {
			decompteSec = donnees.secondesRestantes;
			document.getElementById('decompteDebut').innerHTML = donnees.secondesRestantes + 's';

			decompteInt = setInterval(function() {
				decompteSec--;

				// Si le compte a rebours est terminé mais qu'on est pas l'hôte (joueur1), on l'attend
				if(decompteSec < 0 && m_num != 1) {
					document.getElementById('decompteDebut').innerHTML = 'En attente de l\'hôte ...';
				}
				// Si le compte a rebours est terminé et qu'on est l'hôte, on prévient le serveur du début du jeu
				else if(decompteSec < 0 && m_num == 1) {
					// On prévient le serveur que le jeu débute
					socket.emit('debutQ');

					decompteSec = 999;
					window.clearInterval(decompteInt);
					document.getElementById('debutDans').innerHTML = '';
					document.getElementById('decompteDebut').innerHTML = '';
				}
				else {
					document.getElementById('decompteDebut').innerHTML = decompteSec + 's';
				}
			}, 1000);
		}
	}
});

// Dès qu'on reçoit les informations du jeu (quand on vient d'arriver)
socket.on('getInfosJeu', function(donnees) {
	if(donnees.infos && donnees.num) {
		gameInfos = donnees.infos;

		if(gameInfos.joueur1 != null)
			document.getElementById('joueur1Nom').innerHTML = gameInfos.joueur1.pseudo;
		if(gameInfos.joueur2 != null)
			document.getElementById('joueur2Nom').innerHTML = gameInfos.joueur2.pseudo;
		if(gameInfos.joueur3 != null)
			document.getElementById('joueur3Nom').innerHTML = gameInfos.joueur3.pseudo;
		if(gameInfos.joueur4 != null)
			document.getElementById('joueur4Nom').innerHTML = gameInfos.joueur4.pseudo;

		m_num = donnees.num; // On attribut le rang au joueur
	}
});

// Dès qu'un nouveau joueur rejoint la partie
socket.on('nouveauJoueur', function(donnees) {
	// Si il existe toutes les informations
	if(donnees.jeu_id && donnees.joueurNum && donnees.joueurInfos) {
		// Si le nouveau joueur a rejoint notre partie
		if(donnees.jeu_id == jeu_id) {
			switch(donnees.joueurNum) {
				case 1:
					gameInfos.joueur1 = donnees.joueurInfos;
					document.getElementById('joueur1Nom').innerHTML = gameInfos.joueur1.pseudo;
					postTchat('<span class="italique">' + gameInfos.joueur1.pseudo + ' vient de rejoindre la partie.</span>');
					break;
				case 2:
					gameInfos.joueur2 = donnees.joueurInfos;
					document.getElementById('joueur2Nom').innerHTML = gameInfos.joueur2.pseudo;
					postTchat('<span class="italique">' + gameInfos.joueur2.pseudo + ' vient de rejoindre la partie.</span>');
					break;
				case 3:
					gameInfos.joueur3 = donnees.joueurInfos;
					document.getElementById('joueur3Nom').innerHTML = gameInfos.joueur3.pseudo;
					postTchat('<span class="italique">' + gameInfos.joueur3.pseudo + ' vient de rejoindre la partie.</span>');
					break;
				case 4:
					gameInfos.joueur4 = donnees.joueurInfos;
					document.getElementById('joueur4Nom').innerHTML = gameInfos.joueur4.pseudo;
					postTchat('<span class="italique">' + gameInfos.joueur4.pseudo + ' vient de rejoindre la partie.</span>');
					break;
			}
		}
	}
});

/** Gestion du tchat **/
// Dès qu'on appuis sur entrée (dans le tchat)
document.getElementById("formTchat").onsubmit = function() {
	message = document.getElementById('messageTchat').value; // On récupère la valeur du tchat
	
	if(message.trim() == '')
		return false;

	// On envoie le message au serveur qui va le dispatcher
	socket.emit('messageEnvoie', { message: message });

	// On vide l'input text
	document.getElementById('messageTchat').value = '';

	// On annule la réactualisation de la page après un submit
	return false;
};

// Dès qu'on reçoi un message
socket.on('messageRecoie', function(donnees) {
	// Si on a toutes les informations
	if(donnees.jeu_id && donnees.pseudo && donnees.num && donnees.message) {
		// Si le message nous est bien destiné (même partie)
		if(donnees.jeu_id == jeu_id) {
			// On définit la couleur du pseudo du joueur
			if(donnees.num == 1)
				couleurFormat = couleurJoueur1;
			if(donnees.num == 2)
				couleurFormat = couleurJoueur2;
			if(donnees.num == 3)
				couleurFormat = couleurJoueur3;
			if(donnees.num == 4)
				couleurFormat = couleurJoueur4;

			// On définit le format du message
			formatMessage = '<span class="joueurNom" style="color:' + couleurFormat + '">' + donnees.pseudo + '</span> : ' + donnees.message + '';

			postTchat(formatMessage);
		}
	}
});

socket.on('envoieNotif', function(donnees) {
	if(donnees.jeu_id && donnees.message) {
		if(donnees.jeu_id == jeu_id) {
			postTchat('<span class="italique">' + donnees.message + '</span>');
		}
	}
});
/** **/

/** Event clavier **/
// Lorsqu'on appuis sur une touche du clavier
window.onkeydown = function(event) {
	touche = event.keyCode;

	if(!m_down) {
		if(touche == key.UP || touche == key.LEFT) {
			m_down = true;
			mouvement('0', m_num);
			// On prévient le serveur qu'un joueur a déplacer sa raquette
			socket.emit('mouvementQ', { sens: '0', pos: (gameInfos['joueur' + m_num].position).toString() });
		}
		else if(touche == key.DOWN || touche == key.RIGHT) {
			m_down = true;
			mouvement('1', m_num);
			// On prévient le serveur qu'un joueur a déplacer sa raquette
			socket.emit('mouvementQ', { sens: '1', pos: (gameInfos['joueur' + m_num].position).toString() });
		}
	}
};

// Lorsqu'on relache une touche du clavier
window.onkeyup = function(event) {
	touche = event.keyCode;

	if(touche == key.UP || touche == key.LEFT) {
		m_down = false;
		mouvement('-2', m_num);
		// On prévient le serveur qu'un joueur a déplacer sa raquette
		socket.emit('mouvementQ', { sens: '-2', pos: (gameInfos['joueur' + m_num].position).toString() });
	}
	else if(touche == key.DOWN || touche == key.RIGHT) {
		m_down = false;
		mouvement('-1', m_num);
		// On prévient le serveur qu'un joueur a déplacer sa raquette
		socket.emit('mouvementQ', { sens: '-1', pos: (gameInfos['joueur' + m_num].position).toString() });
	}
};

socket.on('mouvementR', function(donnees) {
	if(donnees.jeu_id && donnees.num && donnees.sens) {
		// On recoit les mouvements de la bonne partie
		if(donnees.jeu_id == jeu_id) {
			mouvement(donnees.sens, donnees.num);

			if(donnees.pos) {
				switch(donnees.num) {
					case 1:
						gameInfos.joueur1.position = donnees.pos;
						break;
					case 2:
						gameInfos.joueur2.position = donnees.pos;
						break;
					case 3:
						gameInfos.joueur3.position = donnees.pos;
						break;
					case 4:
						gameInfos.joueur4.position = donnees.pos;
						break;
				}
			}
		}
	}
});
/* */

// Dès que le serveur prévient que le jeu commence
socket.on('debutR', function(donnees) {
	if(donnees.jeu_id && donnees.jeu_id == jeu_id) {
		gameInfos.enCours = true;
		gameInfos.balleVitesse = 0.5; // On reset la vitesse de la balle
	}
});

// Dès qu'un joueur a perdu et donc un autre à gagné
socket.on('finR', function(donnees) {
		if(donnees.gagnant && donnees.perdant) {
			gameInfos.enCours = false; // On stop la partie temporairement

			ajouterPoint(donnees.gagnant);
			retirerPoint(donnees.perdant);

			gameInfos.balleX = 50-2;
			gameInfos.balleY = 50-2;

			secondeR = 5;

			var d = setInterval(function() {
				document.getElementById('debutDans').innerHTML = 'Début dans';
				document.getElementById('decompteDebut').innerHTML = secondeR + 's';

				secondeR--;

				if(secondeR < 0) {
					window.clearInterval(d);
					gameInfos.enCours = true;

					document.getElementById('debutDans').innerHTML = '';
					document.getElementById('decompteDebut').innerHTML = '';
				}
			}, 1000);
		}
	});

/** Dessiner le jeu **/
setInterval(function() {
	// On vide le canvas
	contexte.clearRect(0, 0, 100*canvasEchelle, 100*canvasEchelle);

	/* On dessine les raquettes */
	// Joueur 1
	if(gameInfos.joueur1 != null) {

		if(gameInfos.joueur1.avancer == true)
			gameInfos.joueur1.position++;
		else if(gameInfos.joueur1.reculer == true)
			gameInfos.joueur1.position--;

		// Si on a trop reculer
		if((2*canvasEchelle+gameInfos.joueur1.position*canvasEchelle) < (4*canvasEchelle))
			gameInfos.joueur1.position = 2;
		// Si on a trop avancer
		if((2*canvasEchelle+gameInfos.joueur1.position*canvasEchelle) > (96*canvasEchelle-20*canvasEchelle))
			gameInfos.joueur1.position = 96-22;

		contexte.fillStyle = couleurJoueur1;
		contexte.fillRect(2*canvasEchelle, 2*canvasEchelle+gameInfos.joueur1.position*canvasEchelle, 2*canvasEchelle, 20*canvasEchelle); 
	}

	// Joueur 2
	if(gameInfos.joueur2 != null) {

		if(gameInfos.joueur2.avancer == true)
			gameInfos.joueur2.position++;
		else if(gameInfos.joueur2.reculer == true)
			gameInfos.joueur2.position--;

		// Si on a trop reculer
		if((2*canvasEchelle+gameInfos.joueur2.position*canvasEchelle) < (4*canvasEchelle))
			gameInfos.joueur2.position = 2;
		// Si on a trop avancer
		if((2*canvasEchelle+gameInfos.joueur2.position*canvasEchelle) > (96*canvasEchelle-20*canvasEchelle))
			gameInfos.joueur2.position = 96-22;

		contexte.fillStyle = couleurJoueur2;
		contexte.fillRect(96*canvasEchelle, 2*canvasEchelle+gameInfos.joueur2.position*canvasEchelle, 2*canvasEchelle, 20*canvasEchelle); 
	}
	else {

		contexte.fillStyle = couleurJoueur2;
		contexte.fillRect(96*canvasEchelle, 2*canvasEchelle, 2*canvasEchelle, 96*canvasEchelle); 
	}

	// Joueur 3
	if(gameInfos.joueur3 != null) {

		if(gameInfos.joueur3.avancer == true)
			gameInfos.joueur3.position++;
		else if(gameInfos.joueur3.reculer == true)
			gameInfos.joueur3.position--;

		// Si on a trop reculer
		if((2*canvasEchelle+gameInfos.joueur3.position*canvasEchelle) < (4*canvasEchelle))
			gameInfos.joueur3.position = 2;
		// Si on a trop avancer
		if((2*canvasEchelle+gameInfos.joueur3.position*canvasEchelle) > (96*canvasEchelle-20*canvasEchelle))
			gameInfos.joueur3.position = 96-22;

		contexte.fillStyle = couleurJoueur3;
		contexte.fillRect(2*canvasEchelle+gameInfos.joueur3.position*canvasEchelle, 2*canvasEchelle, 20*canvasEchelle, 2*canvasEchelle); 
	}
	else {
		contexte.fillStyle = couleurJoueur3;
		contexte.fillRect(2*canvasEchelle, 2*canvasEchelle, 96*canvasEchelle, 2*canvasEchelle); 
	}

	// Joueur 4
	if(gameInfos.joueur4 != null) {

		if(gameInfos.joueur4.avancer == true)
			gameInfos.joueur4.position++;
		else if(gameInfos.joueur4.reculer == true)
			gameInfos.joueur4.position--;

		// Si on a trop reculer
		if((2*canvasEchelle+gameInfos.joueur4.position*canvasEchelle) < (4*canvasEchelle))
			gameInfos.joueur4.position = 2;
		// Si on a trop avancer
		if((2*canvasEchelle+gameInfos.joueur4.position*canvasEchelle) > (96*canvasEchelle-20*canvasEchelle))
			gameInfos.joueur4.position = 96-22;

		contexte.fillStyle = couleurJoueur4;
		contexte.fillRect(2*canvasEchelle+gameInfos.joueur4.position*canvasEchelle, 96*canvasEchelle, 20*canvasEchelle, 2*canvasEchelle); 
	}
	else {
		contexte.fillStyle = couleurJoueur4;
		contexte.fillRect(2*canvasEchelle, 96*canvasEchelle, 96*canvasEchelle, 2*canvasEchelle); 
	}

	/** Mouvement de la balle **/
	// Si la partie a débuté
	if(gameInfos.enCours) {
		gameInfos.balleX += Math.cos(deg2rad(gameInfos.balleAngle))*gameInfos.balleVitesse;
		gameInfos.balleY -= Math.sin(deg2rad(gameInfos.balleAngle))*gameInfos.balleVitesse;
	}

	/* Si la balle touche la raquette du joueur 1 */
	// Si la balle est dans la hauteur de la raquette
	if(gameInfos.joueur1 != null && gameInfos.balleY+4 >= gameInfos.joueur1.position && gameInfos.balleY <= gameInfos.joueur1.position+20) {
		// Si la balle est dans la largeur de la raquette
		if(gameInfos.balleX < 4 && gameInfos.balleX > 2) {
			gameInfos.balleX = 4;

			if(Math.sin(deg2rad(gameInfos.balleAngle)) < 0)
				dBas = true;
			else
				dBas = false;

			gameInfos.balleAngle = rad2deg(Math.acos(-Math.cos(deg2rad(gameInfos.balleAngle))));

			if(dBas) {
				gameInfos.balleAngle *= -1;
			}

			if(gameInfos.joueur1 != null)
				gameInfos.dernRebond = 1;
		}
	}
	/* */

	/* Si la balle touche la raquette du joueur 2 */
	// Si la balle est dans la hauteur de la raquette
	if(
		(gameInfos.joueur2 != null && gameInfos.balleY+4 >= gameInfos.joueur2.position && gameInfos.balleY <= gameInfos.joueur2.position+20)
		|| (gameInfos.joueur2 == null && gameInfos.balleY+4 >= 2 && gameInfos.balleY <= 98)) {
		// Si la balle est dans la largeur de la raquette
		if(gameInfos.balleX > 92 && gameInfos.balleX < 98) {
			gameInfos.balleX = 92;

			if(Math.sin(deg2rad(gameInfos.balleAngle)) < 0)
				dBas = true;
			else
				dBas = false;

			gameInfos.balleAngle = rad2deg(Math.acos(-Math.cos(deg2rad(gameInfos.balleAngle))));

			if(dBas) {
				gameInfos.balleAngle *= -1;
			}

			if(gameInfos.joueur2 != null)
				gameInfos.dernRebond = 2;
		}
	}
	/* */

	/* Si la balle touche la raquette du joueur 3 */
	// Si la balle est dans la largeur de la raquette
	if(
		(gameInfos.joueur3 != null && gameInfos.balleX+4 >= gameInfos.joueur3.position && gameInfos.balleX <= gameInfos.joueur3.position+20)
		|| (gameInfos.joueur3 == null && gameInfos.balleX+4 >= 2 && gameInfos.balleX <= 98)) {
		// Si la balle est dans la hauteur de la raquette
		if(gameInfos.balleY < 4 && gameInfos.balleY > 2) {
			gameInfos.balleY = 4;

			if(Math.cos(deg2rad(gameInfos.balleAngle)) < 0)
				dGauche = true;
			else
				dGauche = false;

			gameInfos.balleAngle = rad2deg(Math.asin(-Math.sin(deg2rad(gameInfos.balleAngle))));

			if(dGauche) {
				gameInfos.balleAngle = - 180 -gameInfos.balleAngle;
			}

			if(gameInfos.joueur3 != null)
				gameInfos.dernRebond = 3;
		}
	}
	/* */

	/* Si la balle touche la raquette du joueur 4 */
	// Si la balle est dans la largeur de la raquette
	console.log(gameInfos.joueur4.position);
	if(
		(gameInfos.joueur4 != null && gameInfos.balleX+4 >= gameInfos.joueur4.position && gameInfos.balleX <= gameInfos.joueur4.position+20)
		|| (gameInfos.joueur4 == null && gameInfos.balleX+4 >= 2 && gameInfos.balleX <= 98)) {
		// Si la balle est dans la hauteur de la raquette
		if(gameInfos.balleY+4 > 96 && gameInfos.balleY < 98) {
			gameInfos.balleY = 92;

			if(Math.cos(deg2rad(gameInfos.balleAngle)) < 0)
				dGauche = true;
			else
				dGauche = false;

			gameInfos.balleAngle = rad2deg(Math.asin(-Math.sin(deg2rad(gameInfos.balleAngle))));

			if(dGauche) {
				gameInfos.balleAngle = 180 - gameInfos.balleAngle;
			}


			if(gameInfos.joueur4 != null)
				gameInfos.dernRebond = 4;
		}
	}
	/* */

	/* Si la balle est sorti du cadre */
	// Si le joueur est l'hôte
	if(m_num == 1) {
		// Si la balle est parti à gauche
		if(gameInfos.balleX < 0) {
			// On prévient le serveur
			socket.emit('finQ', { gagnant: gameInfos.dernRebond, perdant: 1 });
		}
		// Si la balle est parti à droite
		else if(gameInfos.balleX+4 > 100) {
			// On prévient le serveur
			socket.emit('finQ', { gagnant: gameInfos.dernRebond, perdant: 2 });
		}
		// Si la balle est parti en haut
		else if(gameInfos.balleX < 0) {
			// On prévient le serveur
			socket.emit('finQ', { gagnant: gameInfos.dernRebond, perdant: 3 });
		}
		// Si la balle est parti en bas
		else if(gameInfos.balleX+4 > 100) {
			// On prévient le serveur
			socket.emit('finQ', { gagnant: gameInfos.dernRebond, perdant: 4 });
		}
	}
	/* */

	/** **/

	// Balle
	contexte.fillStyle = couleurBalle;
	contexte.fillRect(gameInfos.balleX*canvasEchelle, gameInfos.balleY*canvasEchelle, 4*canvasEchelle, 4*canvasEchelle); 
	/* */

	// On augmente la vitesse de la balle de 1% par seconde soit 0.01% toute les 10 ms donc on multipli sa vitesse par 1,0001
	gameInfos.balleVitesse *= 1.0001;
}, 10); // Toutes les 10 ms soit 0.01 seconde
/** **/