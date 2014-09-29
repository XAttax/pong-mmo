<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
		<meta name="keywords" content="deathfight, izifight, izigame, jeu, serveur, minecraft, pvp, faction, forum, boutique, launcher, mod"/>
		<meta name="description" content="DeathFight est un serveur Minecraft PVP Faction, possédant de nombreux minerais inédit !" />

		<link rel="stylesheet" media="screen" type="text/css" title="Design" href="css/style.css"/>
		<link rel="shortcut icon" type="image/x-icon" href="img/favicon.ico">


		<title>Pong MMO</title>
	</head>
	<body>
		<?php
			function getCode($length) {
				$chars = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Certains caractères ont été enlevés car ils prêtent à confusion
				$rand_str = '';
				for ($i=0; $i<$length; $i++) {
					$rand_str .= $chars{ mt_rand( 0, strlen($chars)-1 ) };
				}
				return $rand_str;
			}

			if(isset($_GET['game_id'])) {
				$game_id = $_GET['game_id'];

				// Si le joueur est sur la page d'accueil
				if($game_id == '') {
					if(!isset($_POST['creerPartie'])) {
						?>
						<span class="titre1">Bienvenue sur Pong MMO</span><br /><br />

						<form id="creerPartie" action="#" method="post">
							<input type="submit" name="creerPartie" value="Créer une partie"/>
						</form>
						<?php
					}
					else {
						$game_code = getCode(6);
						?>

						<script type="text/javascript" src="http://localhost:1337/socket.io/socket.io.js"></script>

						<script type="text/javascript">
							/* Connexion à socket.io */
							var socket = io.connect('http://localhost:1337');
							/* */

							// Création de la partie
							socket.emit('creerPartie', { jeu_id: '<?php echo $game_code; ?>' });

							tempsRestant = 5;

							setInterval(function() {
								tempsRestant--;

								document.getElementById('decompteLancement').innerHTML = tempsRestant;
							}, 1000);

							setTimeout(function() {
								document.location.href = "/Pong/client/<?php echo $game_code; ?>";
							}, 5500);
						</script>

						<span class="titre1">Lancement de votre partie en cours ...<br /><br /><span id="decompteLancement">5</span></span>
						<?php
					}
					?>

					<footer>
						Jeu créé par Benjamin Lecoq<br />
						HTML5 Canvas
					</footer>
					<?php
				}
				// Si le joueur souhaite rejoindre une partie
				else {
					?>
						<audio id="sonTchat" src="sons/tchat.mp3" preload="auto"></audio>

						<div id="droite">
							<div id="joueurs">
								<span class="titre2">Liste des joueurs</span>

								<table class="tableJoueurs">
									<tr>
										<td width="30px"><span id="joueur1Couleur" class="couleur"></span></td>
										<td width="150px"><span id="joueur1Nom">Joueur 1</span></td>
										<td width="50px"><span id="joueur1Score">0 pt</span></td>
										<td id="debutDans" style="text-align:center;">Début dans</td>
									</tr>

									<tr>
										<td width="30px"><span id="joueur2Couleur" class="couleur"></span></td>
										<td width="150px"><span id="joueur2Nom">Joueur 2</span></td>
										<td width="50px"><span id="joueur2Score">0 pt</span></td>
										<td style="text-align:center;"><span id="decompteDebut" style="color:#c0392b;font-weight:bold;">..s</span></td>
									</tr>

									<tr>
										<td width="30px"><span id="joueur3Couleur" class="couleur"></span></td>
										<td width="150px"><span id="joueur3Nom">Joueur 3</span></td>
										<td width="50px"><span id="joueur3Score">0 pt</span></td>
										<td style="text-align:center;">Inviter une personne :</td>
									</tr>

									<tr>
										<td width="30px"><span id="joueur4Couleur" class="couleur"></span></td>
										<td width="150px"><span id="joueur4Nom">Joueur 4</span></td>
										<td width="50px"><span id="joueur4Score">0 pt</span></td>
										<td style="text-align:center;"><input type="text" style="width:80%;padding:2px;" value="<?php echo 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']; ?>"/></td>
									</tr>
								</table>
							</div>

							<div id="tchat">
								<div id="listeMessages" class="scrollBar"></div>

								<form id="formTchat" action="#" method="post">
									<input id="messageTchat" type="text" name="message" value="" placeholder="Parler sur le tchat ..." maxlength="140"/>
								</form>
							</div>
						</div>

						<canvas id="jeu" width="763" height="763"></canvas>

						<script type="text/javascript" src="http://localhost:1337/socket.io/socket.io.js"></script>
						<script type="text/javascript" src="js/client.js"></script>
					<?php
				}
			}
		?>

	</body>
</html>