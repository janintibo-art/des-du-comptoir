'use strict';
/* Règles de tous les jeux — utilisées par la modale ❓ et par regles.html */
window.RULES = {
general: { title:'Bien débuter', html:`
<p><b>Les joueurs.</b> Au lancement de chaque jeu, choisissez le nombre de joueurs (jusqu'à 4)
et, pour chacun, s'il est humain ou tenu par l'ordinateur. Sans ordinateur, jouez à tour de
rôle sur le même téléphone. Le joueur actif est surligné dans la barre des scores.</p>
<p><b>Secouer pour lancer.</b> Activez le bouton 📳 puis secouez le téléphone : cela appuie
sur le bouton principal (Lancer, Relancer…). Sur iPhone, une autorisation est demandée.</p>
<p><b>Les dés.</b> Quand un jeu permet de garder des dés, touchez-les : un anneau doré les
entoure. Le style des dés (12 au choix) se change en haut d'écran et reste mémorisé.</p>`},

'421': { title:'Le 421', html:`
<p>3 dés, 21 fiches au pot. Le but : <b>finir sans fiches</b>.</p>
<p><b>Déroulement.</b> Le meneur lance jusqu'à 3 fois (il peut garder des dés) ; les autres
ont droit au même nombre de lancers maximum. Le <b>perdant du tour</b> (plus mauvaise
combinaison) mène le tour suivant.</p>
<p><b>La charge :</b> le perdant ramasse au pot autant de fiches que vaut la combinaison du
gagnant. <b>La décharge</b> (pot vide) : le gagnant refile ce nombre de fiches au perdant.
Le premier à zéro fiche gagne.</p>
<p><b>Hiérarchie et valeurs :</b> 421 (8 fiches) &gt; brelan d'as 1·1·1 (7) &gt; paire d'as
+ n, 6·1·1 le plus fort (n fiches) &gt; brelan de n (n fiches) &gt; suites 4·5·6 à 1·2·3
(2) &gt; combinaisons simples (1). La <b>nénette</b> 2·2·1 est le pire coup (4 fiches).
Égalité parfaite : <b>rampeau</b>, on se départage.</p>`},

'10000': { title:'Le 10 000', html:`
<p>5 dés. Premier à <b>10 000 points</b>.</p>
<p><b>Ce qui marque :</b> chaque 1 = 100, chaque 5 = 50, brelan de n = n×100 (brelan d'as
= 1000, chaque dé au-delà du brelan double la valeur), suite complète 1-2-3-4-5 ou
2-3-4-5-6 = 1500.</p>
<p><b>Le tour.</b> Lancez les 5 dés, mettez de côté <b>au moins un dé qui marque</b>, puis
relancez le reste ou <b>banquez</b> vos points. Si un lancer ne contient aucun dé qui
marque, le tour est perdu ! Si les 5 dés marquent (« main pleine »), on repart avec les 5
en gardant les points.</p>
<p><b>L'ouverture :</b> il faut marquer au moins 500 points en un seul tour pour commencer
à compter.</p>`},

yams: { title:'Le Yams', html:`
<p>5 dés, 13 tours. Le plus haut total gagne.</p>
<p><b>Le tour.</b> Jusqu'à 3 lancers en gardant les dés de votre choix, puis inscrivez le
résultat dans <b>une case libre</b> de la feuille (quitte à marquer 0).</p>
<p><b>Section haute :</b> As à Six = somme des dés de cette valeur. <b>Bonus de 35</b> si
la section haute atteint 63.</p>
<p><b>Section basse :</b> Brelan et Carré = somme des 5 dés (si 3 ou 4 identiques) ;
Full = 25 ; Petite suite (4 dés qui se suivent) = 30 ; Grande suite (5 dés) = 40 ;
Yams (5 identiques) = 50 ; Chance = somme des 5 dés.</p>`},

poker: { title:'Le Poker d\u2019as', html:`
<p>5 dés, comme une main de poker. Premier à <b>3 manches gagnées</b>.</p>
<p><b>La manche.</b> Chaque joueur lance les 5 dés, garde ce qu'il veut, et relance une
seule fois. La meilleure main l'emporte.</p>
<p><b>Hiérarchie :</b> cinq identiques &gt; carré &gt; full &gt; quinte (1-2-3-4-5 ou
2-3-4-5-6) &gt; brelan &gt; deux paires &gt; paire &gt; hauteur. Départage à la valeur
la plus haute. Égalité parfaite : personne ne marque.</p>`},

zanzibar: { title:'Le Zanzibar', html:`
<p>3 dés, 21 jetons au pot. Quand le pot est vide, celui qui a le <b>moins de jetons</b>
gagne.</p>
<p><b>Déroulement.</b> Comme au 421 : le meneur lance jusqu'à 3 fois (gardes permises) et
fixe le maximum des autres. Le perdant du tour ramasse au pot autant de jetons que vaut
le coup du gagnant, et mène ensuite.</p>
<p><b>Hiérarchie :</b> 4·5·6 « Zanzibar » (4 jetons) &gt; brelan d'as &gt; autres brelans
(3 jetons) &gt; 1·2·3 (2 jetons) &gt; aux points (1 jeton) : l'as vaut 100, le 6 vaut 60,
les autres leur valeur.</p>`},

mexico: { title:'Le Mexico', html:`
<p>2 dés, 3 vies chacun. <b>Dernier survivant</b> gagne.</p>
<p><b>Le score :</b> le plus grand dé forme les dizaines (5 et 3 = 53). Les doubles
battent tout (double 6 le plus fort)… sauf le <b>21, « Mexico »</b>, imbattable.</p>
<p><b>La manche.</b> Le meneur lance jusqu'à 3 fois (on relance les deux dés, le dernier
jet compte) et fixe le maximum des autres. Le plus bas score perd une vie — <b>deux</b>
si le meilleur a fait Mexico. Égalité pour le plus bas : la manche est rejouée. Le perdant
mène ensuite.</p>`},

chicago: { title:'Le Chicago', html:`
<p>2 dés, 11 manches numérotées de <b>2 à 12</b>.</p>
<p>À chaque manche, chaque joueur lance une fois : si la somme des dés égale le numéro de
la manche, il marque ce numéro en points. Après la manche 12, le plus haut total gagne.</p>`},

cochon: { title:'Le Cochon', html:`
<p>1 dé. Premier à <b>100 points</b>.</p>
<p><b>Le tour.</b> Lancez le dé autant de fois que vous osez : chaque face s'ajoute à
votre cagnotte du tour… mais un <b>1</b> efface la cagnotte et rend la main !
<b>Banquez</b> à tout moment pour mettre vos points à l'abri.</p>`},

passedix: { title:'Le Passe-dix', html:`
<p>3 dés. Premier à <b>5 points</b>.</p>
<p>À votre tour, annoncez <b>Passe</b> (la somme fera 11 ou plus) ou <b>Manque</b>
(10 ou moins), puis lancez. Annonce juste : +1 point.</p>`},

boston: { title:'Le Boston', html:`
<p>3 dés, 5 manches. Le plus haut total gagne.</p>
<p><b>La manche.</b> Lancez les 3 dés : le plus fort est mis de côté. Relancez les 2
autres : le plus fort est mis de côté. Relancez le dernier. La somme des trois dés
gardés fait votre score de manche.</p>`},

boite: { title:'La Boîte (Shut the Box)', html:`
<p>2 dés et 9 tuiles numérotées de 1 à 9. Le <b>plus bas score</b> gagne — et fermer
toute la boîte, c'est la victoire immédiate !</p>
<p><b>Le tour.</b> Lancez les dés, puis abaissez des tuiles dont la <b>somme égale le
total des dés</b> (8 = la tuile 8, ou 6+2, ou 5+3, ou 1+3+4…). Rejouez tant que c'est
possible. Quand plus aucune combinaison n'existe, votre score est la somme des tuiles
restées levées.</p>
<p>Quand les tuiles 7, 8 et 9 sont abaissées, vous pouvez choisir de ne lancer qu'un dé.</p>`},

martinetti: { title:'Le Martinetti', html:`
<p>3 dés. Premier à valider la série complète de <b>1 à 12, dans l'ordre</b>.</p>
<p><b>Le tour.</b> Lancez les 3 dés : vous validez le prochain nombre de votre série s'il
apparaît sur un dé seul, sur la somme de deux dés ou des trois (avec 2·3·6 on peut valider
le 2, le 3, le 5, le 6, le 8, le 9, le 11…). On valide autant de nombres consécutifs que
possible avec le même lancer, puis on relance. Un lancer qui ne valide rien rend la main.</p>`},
salon: { title:'Jouer \u00e0 plusieurs t\u00e9l\u00e9phones', html:`
<p>Le <b>Salon</b> connecte 2 \u00e0 4 t\u00e9l\u00e9phones : chacun voit son propre \u00e9cran —
indispensable pour les jeux de cartes o\u00f9 la main reste secr\u00e8te.</p>
<p><b>L'h\u00f4te</b> cr\u00e9e une table et obtient un <b>code de 4 lettres</b> ; les autres
le saisissent pour rejoindre. Une connexion Internet est n\u00e9cessaire pour se trouver,
puis les t\u00e9l\u00e9phones communiquent en direct (id\u00e9alement sur le m\u00eame Wi-Fi ou en
partage de connexion).</p>
<p>Pour offrir le jeu \u00e0 un ami : bouton <b>\ud83d\udce4 Partager l'app</b> sur le menu — l'APK
part par Bluetooth, WhatsApp ou tout autre canal, sans magasin d'applications.</p>
<p><b>Styles de cartes.</b> En jeu, un s\u00e9lecteur permet de choisir parmi 5 jeux de
cartes illustr\u00e9s (dont deux tarots complets de 78 cartes) — chacun choisit le sien
sur son t\u00e9l\u00e9phone.</p>`},

huit: { title:'Le 8 am\u00e9ricain (cartes)', html:`
<p>52 cartes, 2 \u00e0 4 joueurs, chacun sur son t\u00e9l\u00e9phone. Le premier \u00e0 <b>vider sa
main</b> gagne.</p>
<p><b>Le tour.</b> Posez une carte de la <b>m\u00eame couleur</b> ou de la <b>m\u00eame valeur</b>
que la carte du dessus. Les <b>8 sont ma\u00eetres</b> : jouables sur tout, ils permettent
de choisir la couleur demand\u00e9e.</p>
<p>Rien \u00e0 jouer ? <b>Piochez une carte</b> : si elle est jouable vous pouvez la poser,
sinon (ou si vous pr\u00e9f\u00e9rez) vous passez. Pioche vide : la d\u00e9fausse est rebattue.</p>
<p>On distribue 7 cartes \u00e0 2 joueurs, 5 \u00e0 3 ou 4.</p>`},
bataille: { title:'La Bataille', html:`
<p>Jeu de 52 cartes, 2 joueurs. Le paquet est partag\u00e9 en deux. \u00c0 chaque tour, chacun
retourne sa carte du dessus : la plus forte rafle les deux (l'As est la plus forte, puis
Roi, Dame, Valet, 10\u20262).</p>
<p><b>Bataille !</b> \u00c9galit\u00e9 : on pose 3 cartes cach\u00e9es puis une face visible ; la plus
forte emporte tout le tas. Le premier \u00e0 rafler les 52 cartes gagne. Aucun choix : c'est
le hasard pur, id\u00e9al pour d\u00e9couvrir.</p>`},

president: { title:'Le Pr\u00e9sident', html:`
<p>52 cartes, 3 \u00e0 4 joueurs, tout le paquet distribu\u00e9. But : se d\u00e9barrasser de ses
cartes le premier pour devenir <b>Pr\u00e9sident</b> ; le dernier est le <b>Trou du cul</b>.</p>
<p><b>Ordre des cartes :</b> 3 (faible) &lt; 4 &lt; \u2026 &lt; 10 &lt; V &lt; D &lt; R &lt; As
&lt; <b>2 (la plus forte)</b>.</p>
<p><b>Le jeu.</b> Le meneur pose une carte ou un groupe de m\u00eame valeur (paire, brelan,
carr\u00e9). Chacun \u00e0 son tour doit poser <b>le m\u00eame nombre de cartes</b>, de valeur
<b>strictement sup\u00e9rieure</b>, ou passer. Quand tout le monde passe, le dernier \u00e0 avoir
pos\u00e9 ramasse la main et relance.</p>`},

huit: { title:'Le 8 loco', html:`
<p>52 cartes, 2 \u00e0 4 joueurs. Comme le 8 am\u00e9ricain, mais avec des cartes qui piquent.
Premier \u00e0 vider sa main gagne.</p>
<p>Posez une carte de m\u00eame <b>couleur</b> ou m\u00eame <b>valeur</b>. Les <b>8</b> sont
ma\u00eetres (choisissez la couleur). Cartes sp\u00e9ciales : le <b>2</b> fait piocher 2 cartes au
suivant (cumulable si lui aussi pose un 2), le <b>Valet</b> saute le joueur suivant, l'<b>As</b>
change le sens du jeu (\u00e0 2 joueurs, il fait rejouer). Rien \u00e0 poser ? Piochez.</p>`},
tarot: { title:'Le Tarot (simplifi\u00e9)', html:`
<p>Jeu de <b>78 cartes</b> \u00e0 4 joueurs. Version simplifi\u00e9e, <b>sans ench\u00e8res</b> :
chacun joue pour soi et ramasse le plus de <b>points</b> possible dans ses plis.</p>
<p><b>Les cartes.</b> Quatre couleurs de 14 cartes (As\u2026 10, Valet, Cavalier, Dame, Roi),
21 <b>atouts</b> num\u00e9rot\u00e9s, et l'<b>Excuse</b>. Les atouts battent toutes les couleurs ;
l'atout 21 est le plus fort, l'atout 1 (le « Petit ») le plus faible.</p>
<p><b>Jouer.</b> On doit fournir la couleur demand\u00e9e ; \u00e0 d\u00e9faut, on est oblig\u00e9 de
<b>couper \u00e0 l'atout</b> (et de monter plus haut qu'un atout d\u00e9j\u00e0 pos\u00e9 si possible).
L'<b>Excuse</b> se joue quand on veut, ne remporte jamais le pli, et reste dans vos points.</p>
<p><b>Les points</b> (les fameux « bouts ») : le 21, le Petit (atout 1) et l'Excuse valent
4,5 chacun ; Roi 4,5 ; Dame 3,5 ; Cavalier 2,5 ; Valet 1,5 ; les autres 0,5. Le dernier pli
ramasse le <b>chien</b> (6 cartes mises de c\u00f4t\u00e9). 91 points en jeu : le plus haut total gagne.</p>`},
};
