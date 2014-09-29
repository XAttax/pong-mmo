/* Création d'un serveur HTTP */
var http = require('http');
httpServer = http.createServer(function(req, res) {
	res.end('Serveur Pong MMO');
});

httpServer.listen(1337); // On écoute le port 1337 (leet)
/* */

var io = require('socket.io').listen(httpServer); // On inclut socket.io

/* Variables de jeu */
var parties = {};

var erreur = {
	PARTIE_INCORRECT: 0,
	PARTIE_COMPLETE: 1,
	PARTIE_ENCOURS: 2
};
/* */

console.log('Lancement du serveur.');

// Dès qu'un joueur se connecte au jeu
io.sockets.on('connection', function(socket) {

	var m_pseudo = null;
	var m_num = 0;
	var m_jeu_id = 0;

	// Si le joueur se déconnecte
	socket.on('disconnect', function () {
		if(m_pseudo != null && m_num != 0 && m_jeu_id != 0) {
			io.sockets.emit('envoieNotif', { jeu_id: m_jeu_id, message: m_pseudo + ' vient de quitter la partie.' });
		}
	});

	// Si le joueur souhaite créer une partie
	socket.on('creerPartie', function(donnees) {
		// Si il existe l'id de la partie
		if(donnees.jeu_id) {
			// Si la partie n'existe pas
			if(typeof parties[donnees.jeu_id] == 'undefined') {
				console.log('Création de la partie : ' + donnees.jeu_id);

				parties[donnees.jeu_id] = {
					joueur1: null,
					joueur2: null,
					joueur3: null,
					joueur4: null,
					balleX: 50,
					balleY: 50,
					balleAngle: Math.floor((Math.random() * 360) + 1), // Angle de départ choisi à la création du jeu, compris entre 1 et 360 degré
					balleVitesse: 0.5,
					dateCreation: new Date().getTime(),
					dernRebond: 0, // L'id du joueur qui a touché pour la dernière fois la balle
					enCours: false // True si le jeu est en cours, false sinon
				};
			}
		}

		socket.disconnect();
	});

	// Demande de connexion
	socket.on('connexionQ', function(donnees) {
		// Si toutes les informations ont été reçu
		if(donnees.jeu_id && donnees.pseudo) {
			// Si la partie n'existe pas
			if(typeof parties[donnees.jeu_id] == 'undefined') {
				socket.emit('connexionR', erreur.PARTIE_INCORRECT);
			}
			// La partie existe
			else {
				partie = parties[donnees.jeu_id];

				// Si il n'y a plus de place sur la partie
				if(partie.joueur1 != null && partie.joueur2 != null && partie.joueur3 != null && partie.joueur4 != null) {
					socket.emit('connexionR', erreur.PARTIE_COMPLETE);
				}
				// Il reste au moins 1 place
				else {
					console.log(donnees.pseudo + ' a rejoint la partie ' + donnees.jeu_id);

					secRest = Math.floor(((partie.dateCreation+15000)-new Date().getTime())/1000);

					if(secRest <= 0) {
						socket.emit('connexionR', erreur.PARTIE_ENCOURS);
					}
					else {
						socket.emit('connexionR', { secondesRestantes: secRest });

						// Il sera le joueur 1
						if(partie.joueur1 == null) {
							partie.joueur1 = {
								pseudo: donnees.pseudo,
								position: 0,
								avancer: false,
								reculer: false,
								points: 0
							};

							// On signale à tout le monde (sauf la socket courante) qu'il y a un nouveau joueur
							socket.broadcast.emit('nouveauJoueur', { jeu_id: donnees.jeu_id, joueurNum: 1, joueurInfos: partie.joueur1 });
							// On envoie les informations de jeu à la socket courante
							socket.emit('getInfosJeu', { infos: partie, num: 1 });

							m_pseudo = donnees.pseudo;
							m_num = 1;
							m_jeu_id = donnees.jeu_id;
						}
						// Il sera le joueur 2
						else if(partie.joueur2 == null) {
							partie.joueur2 = {
								pseudo: donnees.pseudo,
								position: 0,
								avancer: false,
								reculer: false,
								points: 0
							};

							// On signale à tout le monde qu'il y a un nouveau joueur
							socket.broadcast.emit('nouveauJoueur', { jeu_id: donnees.jeu_id, joueurNum: 2, joueurInfos: partie.joueur2 });
							// On envoie les informations de jeu à la socket courante
							socket.emit('getInfosJeu', { infos: partie, num: 2 });

							m_pseudo = donnees.pseudo;
							m_num = 2;
							m_jeu_id = donnees.jeu_id;
						}
						// Il sera le joueur 3
						else if(partie.joueur3 == null) {
							partie.joueur3 = {
								pseudo: donnees.pseudo,
								position: 0,
								avancer: false,
								reculer: false,
								points: 0
							};

							// On signale à tout le monde qu'il y a un nouveau joueur
							socket.broadcast.emit('nouveauJoueur', { jeu_id: donnees.jeu_id, joueurNum: 3, joueurInfos: partie.joueur3 });
							// On envoie les informations de jeu à la socket courante
							socket.emit('getInfosJeu', { infos: partie, num: 3 });

							m_pseudo = donnees.pseudo;
							m_num = 3;
							m_jeu_id = donnees.jeu_id;
						}
						// Il sera le joueur 4
						else if(partie.joueur4 == null) {
							partie.joueur4 = {
								pseudo: donnees.pseudo,
								position: 0,
								avancer: false,
								reculer: false,
								points: 0
							};

							// On signale à tout le monde qu'il y a un nouveau joueur
							socket.broadcast.emit('nouveauJoueur', { jeu_id: donnees.jeu_id, joueurNum: 4, joueurInfos: partie.joueur4 });
							// On envoie les informations de jeu à la socket courante
							socket.emit('getInfosJeu', { infos: partie, num: 4 });

							m_pseudo = donnees.pseudo;
							m_num = 4;
							m_jeu_id = donnees.jeu_id;
						}
					}
				}
			}
		}
	});

	/** Gestion du tchat **/
	socket.on('messageEnvoie', function(donnees) {
		// Si on a toutes les informations
		if(donnees.message) {
			// On envoie le message à TOUT les joueurs
			io.sockets.emit('messageRecoie', { jeu_id: m_jeu_id, pseudo: m_pseudo, num: m_num, message: donnees.message });
		}
	});
	/** **/

	/** Gestion des déplacements de la raquette */
	socket.on('mouvementQ', function(donnees) {
		if(donnees.sens && donnees.pos) {
			parties[m_jeu_id]['joueur' + m_num].position = parseInt(donnees.pos);
			position = 1;

			position = parties[m_jeu_id]['joueur' + m_num].position;
			if(donnees.sens == '-2') {
				parties[m_jeu_id]['joueur' + m_num].reculer = false;
			}
			else if(donnees.sens == '-1') {
				parties[m_jeu_id]['joueur' + m_num].avancer = false;
			}
			else if(donnees.sens == '0') {
				parties[m_jeu_id]['joueur' + m_num].reculer = true;
			}
			else if(donnees.sens == '1') {
				parties[m_jeu_id]['joueur' + m_num].avancer = true;
			}
			
			// On renvoie la modification de déplacement aux autres joueurs
			socket.broadcast.emit('mouvementR', { jeu_id: m_jeu_id, num: m_num, sens: donnees.sens, pos: position.toString() });	
		}
	});
	/** **/

	// Quand le joueur1 indique au serveur que la partie commence, on prévient les autres
	socket.on('debutQ', function() {
		// Si le joueur est bien l'hôte
		if(m_num == 1) {
			parties[m_jeu_id].enCours = true;

			// On prévient tout les joueurs que le jeu commence
			io.sockets.emit('debutR', { jeu_id: m_jeu_id });
		}
	});

	// Dès qu'un joueur a perdu (et donc un autre à gagné)
	socket.on('finQ', function(donnees) {
		if(donnees.gagnant && donnees.perdant) {
			parties[m_jeu_id]['joueur' + donnees.gagnant].points++;
			parties[m_jeu_id]['joueur' + donnees.perdant].points--;

			io.sockets.emit('finR', { gagnant: donnees.gagnant, perdant: donnees.perdant });
		}
	});

});